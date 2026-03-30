import type { StoragePluginConfig, StorageItem } from '../types';

export interface StorageInstance {
  get: <T = unknown>(key: string) => T | null;
  set: <T = unknown>(key: string, value: T, ttl?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
}

export function createStorageInstance(config: StoragePluginConfig): StorageInstance {
  const prefix = config.prefix || 'vue-json-';
  const storage = config.type === 'sessionStorage' ? sessionStorage : localStorage;

  const getKey = (key: string) => `${prefix}${key}`;
  const getKeys = () => {
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  };

  const get = <T = unknown>(key: string): T | null => {
    try {
      const item = storage.getItem(getKey(key));
      if (!item) return null;

      const parsed: StorageItem<T> = JSON.parse(item);

      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        storage.removeItem(getKey(key));
        return null;
      }

      return parsed.value;
    } catch {
      return null;
    }
  };

  const set = <T = unknown>(key: string, value: T, ttl?: number) => {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : undefined,
      };
      storage.setItem(getKey(key), JSON.stringify(item));
    } catch (error) {
      console.error('[storage] Failed to set item:', error);
    }
  };

  const remove = (key: string) => {
    storage.removeItem(getKey(key));
  };

  const clear = () => {
    const keys = getKeys().filter((k) => k.startsWith(prefix));
    keys.forEach((k) => storage.removeItem(k));
  };

  const has = (key: string) => {
    return storage.getItem(getKey(key)) !== null;
  };

  return { get, set, remove, clear, has };
}
