import { useEffect, useCallback } from 'react';
import {
  initWebSocket,
  disconnectWebSocket,
  onWebSocketEvent,
  offWebSocketEvent,
  isWebSocketConnected
} from '../utils/websocket';

/**
 * Custom hook pro práci s WebSockets
 * @param {object} events - Objekt s event handlery: { eventName: callback, ... }
 * @param {boolean} autoConnect - Automatické připojení (default: true)
 */
export const useWebSocket = (events = {}, autoConnect = true) => {
  useEffect(() => {
    if (autoConnect) {
      initWebSocket();
    }

    // Registrace všech event handlery
    Object.entries(events).forEach(([eventName, callback]) => {
      if (typeof callback === 'function') {
        onWebSocketEvent(eventName, callback);
      }
    });

    // Cleanup: odpojení event handlery
    return () => {
      Object.entries(events).forEach(([eventName, callback]) => {
        if (typeof callback === 'function') {
          offWebSocketEvent(eventName, callback);
        }
      });
    };
  }, [events, autoConnect]);

  return {
    isConnected: isWebSocketConnected(),
    initWebSocket,
    disconnectWebSocket
  };
};

export default useWebSocket;
