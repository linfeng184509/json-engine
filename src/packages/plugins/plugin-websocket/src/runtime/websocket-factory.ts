import type { WebSocketPluginConfig, WebSocketMessage } from '../types';

export interface WebSocketInstance {
  connect: () => void;
  disconnect: () => void;
  send: (topic: string, data: unknown) => void;
  subscribe: (topic: string, callback: (message: WebSocketMessage) => void) => void;
  unsubscribe: (topic: string) => void;
  isConnected: () => boolean;
}

export function createWebSocketInstance(config: WebSocketPluginConfig): WebSocketInstance {
  let connected = false;
  const subscriptions = new Map<string, Set<(message: WebSocketMessage) => void>>();

  const connect = () => {
    console.log(`[websocket] Connecting to ${config.url}`);
    connected = true;
  };

  const disconnect = () => {
    console.log('[websocket] Disconnecting');
    connected = false;
  };

  const send = (topic: string, data: unknown) => {
    if (!connected) {
      console.warn('[websocket] Not connected, cannot send message');
      return;
    }
    console.log(`[websocket] Sending to ${topic}:`, data);
  };

  const subscribe = (topic: string, callback: (message: WebSocketMessage) => void) => {
    if (!subscriptions.has(topic)) {
      subscriptions.set(topic, new Set());
    }
    subscriptions.get(topic)!.add(callback);
    console.log(`[websocket] Subscribed to ${topic}`);
  };

  const unsubscribe = (topic: string) => {
    subscriptions.delete(topic);
    console.log(`[websocket] Unsubscribed from ${topic}`);
  };

  const isConnected = () => connected;

  if (config.autoReconnect !== false) {
    connect();
  }

  return {
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
    isConnected,
  };
}
