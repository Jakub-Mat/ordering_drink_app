const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3001; // Backend poběží na portu 3001
const host = '0.0.0.0'; // Povolit přístup zvenčí (pokud je potřeba pro Docker)

// Povolíme přijímat data z Reactu (který poběží jinde) a formát JSON
app.use(cors());
app.use(express.json());

// 1. Připojení k SQLite databázi (vytvoří soubor databaze.db, pokud neexistuje)
const db = new sqlite3.Database('./databaze.db', (err) => {
    if (err) {
        console.error("Chyba při připojování k databázi:", err.message);
    } else {
        console.log("Úspěšně připojeno k SQLite databázi.");
        
        // Povolíme foreign keys
        db.run("PRAGMA foreign_keys = ON");
        
        // Vytvoření tabulky drinks (menu)
        db.run(`CREATE TABLE IF NOT EXISTS drinks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            category INTEGER DEFAULT 3,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Migration: wipe data, remove icon_name, add category
        db.all(`PRAGMA table_info(drinks)`, [], (err, columns) => {
            if (err) {
                console.error('Chyba při čtení schématu tabulky drinks:', err.message);
                return;
            }
            const hasIconName = columns.some(column => column.name === 'icon_name');
            const hasIcon = columns.some(column => column.name === 'icon');
            const hasCategory = columns.some(column => column.name === 'category');

            // Wipe all data
            db.run("DELETE FROM drinks", (wipeErr) => {
                if (wipeErr) {
                    console.error('Chyba při mazání dat z drinks:', wipeErr.message);
                }
            });

            // Drop old columns
            if (hasIconName) {
                db.run(`ALTER TABLE drinks DROP COLUMN icon_name`, (dropErr) => {
                    if (dropErr) {
                        console.error('Chyba při odstraňování sloupce icon_name:', dropErr.message);
                    }
                });
            }
            if (hasIcon) {
                db.run(`ALTER TABLE drinks DROP COLUMN icon`, (dropErr) => {
                    if (dropErr) {
                        console.error('Chyba při odstraňování sloupce icon:', dropErr.message);
                    }
                });
            }

            // Add category if missing
            if (!hasCategory) {
                db.run(`ALTER TABLE drinks ADD COLUMN category INTEGER DEFAULT 3`, (alterErr) => {
                    if (alterErr) {
                        console.error('Chyba při přidávání sloupce category:', alterErr.message);
                    }
                });
            }
        });
        
        // Vytvoření tabulky orders
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // Vytvoření tabulky order_items (propojení objednávky a nápojů)
        db.run(`CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            drink_id INTEGER NOT NULL,
            FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY(drink_id) REFERENCES drinks(id) ON DELETE CASCADE
        )`);
    }
});

// 2. API endpoints pro nápoje (menu management)

// GET /api/drinks - Získání všech nápojů z menu
app.get('/api/drinks', (req, res) => {
    db.all("SELECT id, name, description, category, created_at FROM drinks ORDER BY created_at DESC", [], (err, rows) => {        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "data": rows
        });
    });
});

// POST /api/drinks - Vytvoření nového nápoje v menu
app.post('/api/drinks', (req, res) => {
    const { name, description, category } = req.body;
    const cat = category || 3;
    
    // Validace
    if (!name) {
        res.status(400).json({"error": "name je povinný"});
        return;
    }
    
    db.run(
        `INSERT INTO drinks (name, description, category) VALUES (?, ?, ?)`,
        [name, description || '', cat],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    res.status(400).json({"error": "Nápoj s tímto jménem již existuje"});
                } else {
                    res.status(400).json({"error": err.message});
                }
                return;
            }
            res.status(201).json({
                "id": this.lastID,
                "name": name,
                "description": description || '',
                "category": cat,
                "created_at": new Date().toISOString()
            });
        }
    );
});

// PATCH /api/drinks/:id - Aktualizace existujícího nápoje
app.patch('/api/drinks/:id', (req, res) => {
    const id = req.params.id;
    const { name, description, category } = req.body;
    const cat = category || 3;

    if (!name) {
        res.status(400).json({"error": "name je povinný"});
        return;
    }

    db.run(
        `UPDATE drinks SET name = ?, description = ?, category = ? WHERE id = ?`,
        [name, description || '', cat, id],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    res.status(400).json({"error": "Nápoj s tímto jménem již existuje"});
                } else {
                    res.status(400).json({"error": err.message});
                }
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({"error": "Nápoj nenalezen"});
                return;
            }
            res.json({
                "id": Number(id),
                "name": name,
                "description": description || '',
                "category": cat
            });
        }
    );
});

// DELETE /api/drinks/:id - Smazání nápoje z menu
app.delete('/api/drinks/:id', (req, res) => {
    const id = req.params.id;
    
    db.run(
        `DELETE FROM drinks WHERE id = ?`,
        [id],
        function(err) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({"error": "Nápoj nenalezen"});
                return;
            }
            res.json({
                "message": "Nápoj smazán",
                "id": id
            });
        }
    );
});

// 3. API endpoints pro objednávky

// GET /api/orders - Získání všech objednávek s jejich nápoji
app.get('/api/orders', (req, res) => {
    const query = `
        SELECT 
            o.id, 
            o.customer_name, 
            o.status, 
            o.created_at,
            GROUP_CONCAT(d.id) as drink_ids,
            GROUP_CONCAT(d.name) as drink_names
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN drinks d ON oi.drink_id = d.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        // Převod GROUP_CONCAT na pole
        const formattedRows = rows.map(row => ({
            id: row.id,
            customer_name: row.customer_name,
            status: row.status,
            created_at: row.created_at,
            drink_ids: row.drink_ids ? row.drink_ids.split(',').map(Number) : [],
            drink_names: row.drink_names ? row.drink_names.split(',') : []
        }));
        res.json({
            "data": formattedRows
        });
    });
});

// POST /api/orders - Vytvoření nové objednávky s více nápoji (transaction)
app.post('/api/orders', (req, res) => {
    const { customer_name, drink_ids } = req.body;
    
    // Validace
    if (!customer_name) {
        res.status(400).json({"error": "customer_name je povinný"});
        return;
    }
    
    if (!Array.isArray(drink_ids) || drink_ids.length === 0) {
        res.status(400).json({"error": "drink_ids musí být pole aspoň s jedním nápoji"});
        return;
    }
    
    // Použití transakce pro více operací
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        // Vložení objednávky
        db.run(
            `INSERT INTO orders (customer_name, status) VALUES (?, ?)`,
            [customer_name, 'pending'],
            function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    res.status(400).json({"error": err.message});
                    return;
                }
                
                const orderId = this.lastID;
                let completed = 0;
                let hasError = false;
                
                // Vložení items do objednávky
                drink_ids.forEach((drink_id, index) => {
                    db.run(
                        `INSERT INTO order_items (order_id, drink_id) VALUES (?, ?)`,
                        [orderId, drink_id],
                        function(err) {
                            if (err && !hasError) {
                                hasError = true;
                                db.run("ROLLBACK");
                                res.status(400).json({"error": `Nápoj s ID ${drink_id} neexistuje`});
                                return;
                            }
                            
                            completed++;
                            
                            // Když jsou všechny items vloženy, potvrdit transakci
                            if (completed === drink_ids.length && !hasError) {
                                db.run("COMMIT", function(err) {
                                    if (err) {
                                        res.status(400).json({"error": err.message});
                                        return;
                                    }
                                    res.status(201).json({
                                        "id": orderId,
                                        "customer_name": customer_name,
                                        "status": 'pending',
                                        "drink_ids": drink_ids,
                                        "created_at": new Date().toISOString()
                                    });
                                });
                            }
                        }
                    );
                });
            }
        );
    });
});

// PATCH /api/orders/:id - Aktualizace statusu objednávky
app.patch('/api/orders/:id', (req, res) => {
    const { status } = req.body;
    const id = req.params.id;
    
    // Validace
    if (!status) {
        res.status(400).json({"error": "status je povinný"});
        return;
    }
    
    // Ověření, že status je z povolených hodnot
    const validStatuses = ['pending', 'preparing', 'ready', 'cancelled'];
    if (!validStatuses.includes(status)) {
        res.status(400).json({
            "error": `Neplatný status. Povolené: ${validStatuses.join(', ')}`
        });
        return;
    }
    
    db.run(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [status, id],
        function(err) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({"error": "Objednávka nenalezena"});
                return;
            }
            res.json({
                "message": "Objednávka aktualizována",
                "id": id,
                "status": status
            });
        }
    );
});

// DELETE /api/orders/:id - Smazání objednávky (pouze pro dokončené objednávky)
app.delete('/api/orders/:id', (req, res) => {
    const id = req.params.id;
    
    // Nejprve zkontrolujeme status objednávky
    db.get("SELECT status FROM orders WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        if (!row) {
            res.status(404).json({"error": "Objednávka nenalezena"});
            return;
        }
        if (row.status !== 'ready') {
            res.status(400).json({"error": "Lze smazat pouze dokončené objednávky (status 'ready')"});
            return;
        }
        
        // Smazání objednávky (order_items se smažou automaticky díky CASCADE)
        db.run("DELETE FROM orders WHERE id = ?", [id], function(err) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.json({
                "message": "Objednávka smazána",
                "id": id
            });
        });
    });
});

// Spuštění serveru
app.listen(port, host, () => {
    console.log(`Backend server běží na http://${host}:${port}`);
    console.log(`API endpoints:`);
    console.log(`GET /api/drinks - Získat všechny nápoje`);
    console.log(`POST /api/drinks - Vytvořit nový nápoj`);
    console.log(`DELETE /api/drinks/:id - Smazat nápoj`);
    console.log(`GET /api/orders - Získat všechny objednávky`);
    console.log(`POST /api/orders - Vytvořit novou objednávku`);
    console.log(`PATCH /api/orders/:id - Aktualizovat status objednávky`);
    console.log(`DELETE /api/orders/:id - Smazat objednávku (pouze pokud je 'ready')`);
    console.log(`Pro ukončení serveru stiskněte Ctrl+C`);
});