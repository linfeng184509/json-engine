export interface WebSocketPluginConfig {
  url: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  topics?: string[];
}

export interface WebSocketMessage {
  topic: string;
  data: unknown;
  timestamp?: number;
}

export interface CoreScopeWS {
  send: (topic: string, data: unknown) => void;
  subscribe: (topic: string, callback: (message: WebSocketMessage) => void) => void;
  unsubscribe: (topic: string) => void;
  connect: () => void;
  disconnect: () => void;
  isConnected: () => boolean;
}
