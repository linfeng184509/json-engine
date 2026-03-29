import type { AxiosRequestConfig, WSConfig } from '../types/app';
import type { AxiosRetryConfig } from '../types/app';

export interface NetworkFactoryOptions {
  axios?: AxiosRequestConfig & { retry?: AxiosRetryConfig };
  websocket?: WSConfig[];
}

export interface WSConnection {
  send: (data: unknown) => void;
  close: () => void;
  on: (event: string, handler: WSMessageHandler) => void;
  off: (event: string, handler: WSMessageHandler) => void;
}

export type WSMessageHandler = (data: unknown) => void;

const wsConnections = new Map<string, WSConnection>();

export function createAxiosInstance(config: AxiosRequestConfig): unknown {
  return config;
}

export function configInterceptors(_instance: unknown): void {
}

export function configRetry(_instance: unknown, _retryConfig?: AxiosRetryConfig): void {
}

export function createWSConnection(config: WSConfig): WSConnection {
  const connection: WSConnection = {
    send: (_data: unknown) => {},
    close: () => {
      wsConnections.delete(config.url);
    },
    on: (_event: string, _handler: WSMessageHandler) => {},
    off: (_event: string, _handler: WSMessageHandler) => {},
  };

  wsConnections.set(config.url, connection);
  return connection;
}

export function subscribeWSChannel(_channel: string, _handler: WSMessageHandler): void {
}

export function bindWSToState(_ws: WSConnection, _state: Record<string, unknown>, _path: string): void {
}

export function getWSConnection(url: string): WSConnection | undefined {
  return wsConnections.get(url);
}

export function closeAllWS(): void {
  for (const conn of wsConnections.values()) {
    conn.close();
  }
  wsConnections.clear();
}

export function createNetwork(options?: NetworkFactoryOptions): {
  axios?: unknown;
  websocket?: WSConnection[];
} {
  const result: { axios?: unknown; websocket?: WSConnection[] } = {};

  if (options?.axios) {
    result.axios = createAxiosInstance(options.axios);
  }

  if (options?.websocket) {
    result.websocket = options.websocket.map(cfg => createWSConnection(cfg));
  }

  return result;
}