import { WebSocketClient } from './client';
import type { WSHandlers, WSConfig } from './client';
import type { KickPayload, NotificationPayload } from '../types/websocket';

let wsClient: WebSocketClient | null = null;

export function initWebSocket(config: WSConfig, handlers: WSHandlers = {}): WebSocketClient {
  if (wsClient) {
    wsClient.disconnect();
  }
  
  const defaultHandlers: WSHandlers = {
    onKick: (payload: KickPayload) => {
      console.log('Kicked from WebSocket:', payload.reason);
      handlers.onKick?.(payload);
      
      const messages: Record<KickPayload['reason'], string> = {
        duplicate_login: '您已在其他设备登录，当前会话已失效',
        token_expired: '登录已过期，请重新登录',
        admin_kick: '您已被管理员强制登出',
      };
      
      alert(messages[payload.reason]);
      window.location.href = '/login';
    },
    onNotification: (payload: NotificationPayload) => {
      console.log('Notification received:', payload);
      handlers.onNotification?.(payload);
    },
    onConnect: () => {
      console.log('WebSocket connected');
      handlers.onConnect?.();
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
      handlers.onDisconnect?.();
    },
    onError: (error: Error) => {
      console.error('WebSocket error:', error);
      handlers.onError?.(error);
    },
  };
  
  wsClient = new WebSocketClient(config, defaultHandlers);
  wsClient.connect();
  
  return wsClient;
}

export function getWebSocketClient(): WebSocketClient | null {
  return wsClient;
}

export function disconnectWebSocket(): void {
  if (wsClient) {
    wsClient.disconnect();
    wsClient = null;
  }
}

export function sendWebSocketMessage(type: string, payload?: unknown): void {
  if (wsClient) {
    wsClient.send(type, payload);
  }
}