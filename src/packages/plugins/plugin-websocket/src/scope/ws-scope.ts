import type { WebSocketPluginConfig, CoreScopeWS } from '../types';
import { createWebSocketInstance } from '../runtime/websocket-factory';

export function createWSScope(config: WebSocketPluginConfig): CoreScopeWS {
  const ws = createWebSocketInstance(config);

  return {
    send: ws.send,
    subscribe: ws.subscribe,
    unsubscribe: ws.unsubscribe,
    connect: ws.connect,
    disconnect: ws.disconnect,
    isConnected: ws.isConnected,
  };
}
