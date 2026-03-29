import type { WSMessage, NotificationPayload, KickPayload } from '../types/websocket';

export interface WSConfig {
  url: string;
  token: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export interface WSHandlers {
  onKick?: (payload: KickPayload) => void;
  onNotification?: (payload: NotificationPayload) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WSConfig;
  private handlers: WSHandlers;
  private reconnectAttempts = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnected = false;

  constructor(config: WSConfig, handlers: WSHandlers = {}) {
    this.config = {
      autoReconnect: true,
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...config,
    };
    this.handlers = handlers;
  }

  connect(): void {
    const url = `${this.config.url}?token=${encodeURIComponent(this.config.token)}`;
    
    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.handlers.onConnect?.();
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          this.handlers.onError?.(new Error('Invalid message format'));
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.handlers.onDisconnect?.();
        
        if (this.config.autoReconnect && this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.handlers.onError?.(new Error('WebSocket error'));
      };
    } catch (error) {
      this.handlers.onError?.(error as Error);
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    this.stopReconnect();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
  }

  send(type: string, payload?: unknown): void {
    if (this.ws && this.isConnected) {
      const message: WSMessage = {
        type,
        payload,
        timestamp: Date.now(),
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  private handleMessage(message: WSMessage): void {
    switch (message.type) {
      case 'heartbeat':
        this.send('heartbeat:ack');
        break;
      case 'auth:kick':
        this.handlers.onKick?.(message.payload as KickPayload);
        this.disconnect();
        break;
      case 'notification:push':
        this.handlers.onNotification?.(message.payload as NotificationPayload);
        break;
      case 'auth:login:success':
        console.log('WebSocket authenticated successfully');
        break;
      case 'auth:error':
        this.handlers.onError?.(new Error((message.payload as { error: string }).error));
        break;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send('heartbeat:ping');
      }
    }, this.config.heartbeatInterval || 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const interval = Math.min(
      (this.config.reconnectInterval || 5000) * Math.pow(2, this.reconnectAttempts - 1),
      20000
    );
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, interval);
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }
}