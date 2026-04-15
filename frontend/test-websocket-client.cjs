/**
 * WebSocket Client Test Script
 * Ověří připojení klienta k serveru a příjem WebSocket eventů
 */

const io = require('socket.io-client');

const WS_URL = 'http://localhost:3001';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

const http = require('http');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3001,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testWebSocketClient() {
  log(colors.cyan, '\n=== WebSocket Client Test ===\n');

  // Vytvoření socket klienta
  log(colors.blue, 'Připojuji se k WebSocket serveru...');
  const socket = io(WS_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Kontrola připojení
  await new Promise((resolve) => {
    socket.on('connect', () => {
      log(colors.green, `✓ WebSocket připojen (Socket ID: ${socket.id})`);
      testsPassed++;
      resolve();
    });

    socket.on('connect_error', (error) => {
      log(colors.red, `✗ Chyba připojení: ${error}`);
      testsFailed++;
      resolve();
    });

    setTimeout(() => {
      if (!socket.connected) {
        log(colors.red, '✗ Timeout - připojení se nezdařilo');
        testsFailed++;
        resolve();
      }
    }, 5000);
  });

  // Test 2: Ping-pong test
  log(colors.blue, '\nTestuji Ping-Pong...');
  await new Promise((resolve) => {
    socket.emit('ping', (response) => {
      if (response === 'pong') {
        log(colors.green, '✓ Ping-Pong funguje správně');
        testsPassed++;
      } else {
        log(colors.red, `✗ Neočekávaná odpověď: ${response}`);
        testsFailed++;
      }
      resolve();
    });

    setTimeout(() => {
      log(colors.red, '✗ Timeout - Ping-Pong neodpověděl');
      testsFailed++;
      resolve();
    }, 3000);
  });

  // Test 3: Naslouchání na newOrder event
  log(colors.blue, '\nNaslouchám na WebSocket event "newOrder"...');
  let newOrderReceived = false;
  let orderStatusChangedReceived = false;

  socket.on('newOrder', (order) => {
    log(colors.green, `✓ Event "newOrder" přijat:`);
    log(colors.magenta, `  ID: ${order.id}, Zákazník: ${order.customer_name}, Status: ${order.status}`);
    newOrderReceived = true;
  });

  socket.on('orderStatusChanged', (update) => {
    log(colors.green, `✓ Event "orderStatusChanged" přijat:`);
    log(colors.magenta, `  ID: ${update.id}, Nový status: ${update.status}`);
    orderStatusChangedReceived = true;
  });

  // Test 4: Vytvoření objednávky (trigger newOrder event)
  log(colors.blue, '\nVytvářím objednávku pro trigger WebSocket eventu...');
  
  try {
    const drinksResponse = await makeRequest('http://localhost:3001/api/drinks');
    const drinkIds = drinksResponse.data.data.slice(0, 1).map(d => d.id);

    const orderResponse = await makeRequest('http://localhost:3001/api/orders', {
      method: 'POST',
      body: {
        customer_name: `WebSocket Test ${Date.now()}`,
        drink_ids: drinkIds
      }
    });

    if (orderResponse.status === 201) {
      log(colors.yellow, `  Objednávka vytvořena: ${orderResponse.data.id}`);
      
      // Čekání na event
      await new Promise((resolve) => {
        setTimeout(() => {
          if (newOrderReceived) {
            log(colors.green, '✓ "newOrder" event úspěšně přijat!');
            testsPassed++;
          } else {
            log(colors.red, '✗ "newOrder" event nebyl přijat');
            testsFailed++;
          }
          resolve();
        }, 1500);
      });

      // Test 5: Změna statusu objednávky (trigger orderStatusChanged event)
      log(colors.blue, '\nMěním status objednávky...');
      const statusResponse = await makeRequest(`http://localhost:3001/api/orders/${orderResponse.data.id}`, {
        method: 'PATCH',
        body: { status: 'preparing' }
      });

      if (statusResponse.status === 200) {
        log(colors.yellow, `  Status změněn na: ${statusResponse.data.status}`);

        // Čekání na event
        await new Promise((resolve) => {
          setTimeout(() => {
            if (orderStatusChangedReceived) {
              log(colors.green, '✓ "orderStatusChanged" event úspěšně přijat!');
              testsPassed++;
            } else {
              log(colors.red, '✗ "orderStatusChanged" event nebyl přijat');
              testsFailed++;
            }
            resolve();
          }, 1500);
        });
      }
    }
  } catch (error) {
    log(colors.red, `✗ Chyba při vytváření objednávky: ${error.message}`);
    testsFailed++;
  }

  // Shrnutí
  log(colors.cyan, '\n=== Test Summary ===');
  log(colors.green, `Úspěšných testů: ${testsPassed}`);
  if (testsFailed > 0) {
    log(colors.red, `Selhavších testů: ${testsFailed}`);
  }

  log(colors.cyan, '\n=== Závěry ===');
  if (testsFailed === 0) {
    log(colors.green, '✓ Všechny testy prošly! WebSocket je plně funkční.');
    log(colors.yellow, '\nFeatures:');
    log(colors.yellow, '  • Připojení klienta k serveru');
    log(colors.yellow, '  • Ping-Pong komunikace');
    log(colors.yellow, '  • Real-time "newOrder" notifikace');
    log(colors.yellow, '  • Real-time "orderStatusChanged" notifikace');
  } else {
    log(colors.red, '✗ Některé testy selhaly. Zkontrolujte výše.');
  }

  log(colors.cyan, '\n');
  
  // Udržení socketů v paměti
  socket.disconnect();
  process.exit(testsFailed === 0 ? 0 : 1);
}

// Spuštění testů
testWebSocketClient().catch((error) => {
  log(colors.red, `Chyba: ${error.message}`);
  process.exit(1);
});
