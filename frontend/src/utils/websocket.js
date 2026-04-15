import io from 'socket.io-client';

let socket = null;
let listeners = {};

/**
 * Inicializace WebSocket připojení
 */
export const initWebSocket = () => {
  if (socket && socket.connected) {
    console.log('[WebSocket] Již připojen');
    return socket;
  }

  const socketUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
  
  socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('[WebSocket] Připojen k serveru');
    // Pošleme ping k ověření připojení
    socket.emit('ping', (response) => {
      console.log('[WebSocket] Server odpověď:', response);
    });
  });

  socket.on('disconnect', () => {
    console.log('[WebSocket] Odpojeno od serveru');
  });

  socket.on('connect_error', (error) => {
    console.error('[WebSocket] Chyba připojení:', error);
  });

  return socket;
};

/**
 * Odpojení WebSocket
 */
export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    listeners = {};
  }
};

/**
 * Přihlášení se na WebSocket event
 * @param {string} eventName - Název eventy
 * @param {function} callback - Callback funkce
 */
export const onWebSocketEvent = (eventName, callback) => {
  if (!socket) {
    console.warn(`[WebSocket] Socket není inicializován. Inicializuji...`);
    initWebSocket();
  }

  // Uložíme listener pro pozdější odhlášení
  if (!listeners[eventName]) {
    listeners[eventName] = [];
  }
  listeners[eventName].push(callback);

  // Registrujeme listener
  socket.on(eventName, callback);
  console.log(`[WebSocket] Naslouchám na event: ${eventName}`);
};

/**
 * Odhlášení se z WebSocket eventu
 * @param {string} eventName - Název eventu
 * @param {function} callback - Callback funkce (volitelná)
 */
export const offWebSocketEvent = (eventName, callback) => {
  if (!socket) return;

  if (callback) {
    socket.off(eventName, callback);
  } else {
    socket.off(eventName);
  }

  console.log(`[WebSocket] Přestal jsem poslouchat event: ${eventName}`);
};

/**
 * Emisní WebSocket event na server
 * @param {string} eventName - Název eventu
 * @param {any} data - Data k odeslání
 */
export const emitWebSocketEvent = (eventName, data) => {
  if (!socket) {
    console.warn('[WebSocket] Socket není inicializován');
    return;
  }

  socket.emit(eventName, data);
  console.log(`[WebSocket] Odeslal jsem event: ${eventName}`, data);
};

/**
 * Vrácení socket objektu
 */
export const getSocket = () => socket;

/**
 * Kontrola, zda je socket připojen
 */
export const isWebSocketConnected = () => {
  return socket && socket.connected;
};
