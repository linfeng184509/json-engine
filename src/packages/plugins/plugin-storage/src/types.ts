export interface StoragePluginConfig {
  prefix?: string;
  encrypt?: boolean;
  encryptKey?: string;
  sync?: boolean;
  type?: 'localStorage' | 'sessionStorage';
}

export interface StorageItem<T = unknown> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

export interface CoreScopeStorage {
  get: <T = unknown>(key: string) => T | null;
  set: <T = unknown>(key: string, value: T, ttl?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
}
