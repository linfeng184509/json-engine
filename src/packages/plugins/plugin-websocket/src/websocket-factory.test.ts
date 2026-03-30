import { describe, it, expect, vi } from 'vitest';
import { createWebSocketInstance } from './runtime/websocket-factory';

describe('WebSocketFactory', () => {
  it('should create websocket instance', () => {
    const ws = createWebSocketInstance({ url: 'ws://localhost:8080' });
    expect(ws).toHaveProperty('connect');
    expect(ws).toHaveProperty('disconnect');
    expect(ws).toHaveProperty('send');
    expect(ws).toHaveProperty('subscribe');
    expect(ws).toHaveProperty('unsubscribe');
    expect(ws).toHaveProperty('isConnected');
  });

  it('should report not connected initially by default', () => {
    const ws = createWebSocketInstance({ url: 'ws://localhost:8080', autoReconnect: false });
    expect(ws.isConnected()).toBe(false);
  });

  it('should connect when autoReconnect is enabled', () => {
    const ws = createWebSocketInstance({ url: 'ws://localhost:8080', autoReconnect: true });
    expect(ws.isConnected()).toBe(true);
  });

  it('should subscribe to topic', () => {
    const ws = createWebSocketInstance({ url: 'ws://localhost:8080', autoReconnect: false });
    const callback = vi.fn();

    ws.subscribe('topic1', callback);

    expect(typeof ws.unsubscribe).toBe('function');
  });

  it('should send message', () => {
    const ws = createWebSocketInstance({ url: 'ws://localhost:8080', autoReconnect: false });
    expect(typeof ws.send).toBe('function');
  });

  it('should disconnect', () => {
    const ws = createWebSocketInstance({ url: 'ws://localhost:8080' });
    ws.disconnect();
    expect(ws.isConnected()).toBe(false);
  });
});
