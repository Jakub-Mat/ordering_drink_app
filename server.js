const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3001; // Backend poběží na portu 3001

// Povolíme přijímat data z Reactu (který poběží jinde) a formát JSON
app.use(cors());
app.use(express.json());

// 1. Připojení k SQLite databázi (vytvoří soubor databaze.db, pokud neexistuje)
const db = new sqlite3.Database('./databaze.db', (err) => {
    if (err) {
        console.error("Chyba při připojování k databázi:", err.message);
    } else {
        console.log("Úspěšně připojeno k SQLite databázi.");
        
        // Vytvoření cvičné tabulky (pokud už neexistuje)
        db.run(`CREATE TABLE IF NOT EXISTS uzivatele (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jmeno TEXT,
            vek INTEGER
        )`);
    }
});

// 2. Vytvoření API endpointu (adresy), přes kterou React získá data
app.get('/api/uzivatele', (req, res) => {
    db.all("SELECT * FROM uzivatele", [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "data": rows
        });
    });
});

// Spuštění serveru
app.listen(port, () => {
    console.log(`Backend server běží na adrese http://localhost:${port}`);
});