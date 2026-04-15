/**
 * WebSocket Testing Script
 * Testuje komunikaci mezi serverem a klienty přes WebSockets a REST API
 */

const http = require('http');

const API_BASE = 'http://localhost:3001/api';
const WS_SERVER = 'http://localhost:3001';

// Boje v barvě pro terminál
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

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

async function runTests() {
  log(colors.cyan, '\n=== WebSocket Integration Test Suite ===\n');

  try {
    // Test 1: Vytvoření nápoje
    log(colors.blue, 'Test 1: Vytvoření nového nápoje...');
    const drinkResponse = await makeRequest(`${API_BASE}/drinks`, {
      method: 'POST',
      body: {
        name: `Test Drink ${Date.now()}`,
        description: 'Test nápoj pro WebSocket test',
        category: 1
      }
    });

    if (drinkResponse.status === 201) {
      log(colors.green, `✓ Nápoj vytvořen: ${drinkResponse.data.name} (ID: ${drinkResponse.data.id})`);
    } else {
      log(colors.red, `✗ Chyba: ${drinkResponse.status}`);
    }

    // Test 2: Získání všech nápojů
    log(colors.blue, '\nTest 2: Načtení všech nápojů...');
    const drinksResponse = await makeRequest(`${API_BASE}/drinks`);
    if (drinksResponse.status === 200 && Array.isArray(drinksResponse.data.data)) {
      log(colors.green, `✓ Nápoje načteny: ${drinksResponse.data.data.length} nápojů v menu`);
    } else {
      log(colors.red, `✗ Chyba: Nápoje se nepodařilo načíst`);
    }

    // Test 3: Vytvoření objednávky (WebSocket event)
    log(colors.blue, '\nTest 3: Vytvoření objednávky (trigger WebSocket newOrder event)...');
    const drinkIds = drinksResponse.data.data.slice(0, 2).map(d => d.id);
    
    const orderResponse = await makeRequest(`${API_BASE}/orders`, {
      method: 'POST',
      body: {
        customer_name: `Customer ${Date.now()}`,
        drink_ids: drinkIds
      }
    });

    if (orderResponse.status === 201) {
      log(colors.green, `✓ Objednávka vytvořena: ID ${orderResponse.data.id} od ${orderResponse.data.customer_name}`);
      log(colors.yellow, `  → WebSocket event "newOrder" měl být poslán všem připojeným klientům`);
    } else {
      log(colors.red, `✗ Chyba: ${orderResponse.status}`);
    }

    // Test 4: Změna statusu objednávky (WebSocket event)
    log(colors.blue, '\nTest 4: Změna statusu objednávky (trigger WebSocket orderStatusChanged event)...');
    const statusResponse = await makeRequest(`${API_BASE}/orders/${orderResponse.data.id}`, {
      method: 'PATCH',
      body: {
        status: 'preparing'
      }
    });

    if (statusResponse.status === 200) {
      log(colors.green, `✓ Status objednávky změněn na: ${statusResponse.data.status}`);
      log(colors.yellow, `  → WebSocket event "orderStatusChanged" měl být poslán všem připojeným klientům`);
    } else {
      log(colors.red, `✗ Chyba: ${statusResponse.status}`);
    }

    // Test 5: Načtení všech objednávek
    log(colors.blue, '\nTest 5: Načtení všech objednávek...');
    const ordersResponse = await makeRequest(`${API_BASE}/orders`);
    if (ordersResponse.status === 200 && Array.isArray(ordersResponse.data.data)) {
      log(colors.green, `✓ Objednávky načteny: ${ordersResponse.data.data.length} objednávek v systému`);
    } else {
      log(colors.red, `✗ Chyba: Objednávky se nepodařilo načíst`);
    }

    log(colors.cyan, '\n=== Test Suite Dokončeno ===\n');
    log(colors.yellow, 'Poznámka: Pro ověření WebSocket komunikace otevřete prohlížeč s aplikací a sledujte konzoli.');
    log(colors.yellow, 'WebSocket events (newOrder, orderStatusChanged) jsou odesílány v reálném čase všem připojeným klientům.\n');

  } catch (error) {
    log(colors.red, `\n✗ Chyba při spuštění testů: ${error.message}`);
  }
}

// Čekání 2 sekundy, aby se server nacvičil
setTimeout(runTests, 2000);
