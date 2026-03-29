import type { StorageConfig } from '../types/app';

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  get length(): number;
}

class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }

  key(index: number): string | null {
    return localStorage.key(index);
  }

  get length(): number {
    return localStorage.length;
  }
}

class SessionStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
  }

  key(index: number): string | null {
    return sessionStorage.key(index);
  }

  get length(): number {
    return sessionStorage.length;
  }
}

let storageAdapter: StorageAdapter = new LocalStorageAdapter();
let prefix = '';
let encryptionKey = '';
let syncEnabled = false;

const subscribers: Array<(key: string, value: unknown) => void> = [];

export function createStorageAdapter(config?: StorageConfig): StorageAdapter {
  if (config?.prefix) {
    prefix = config.prefix;
  }

  if (config?.encrypt && config?.encryptKey) {
    encryptionKey = config.encryptKey;
  }

  syncEnabled = config?.sync ?? false;

  if (syncEnabled && typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange);
  }

  return storageAdapter;
}

export function syncToStorage(key: string, value: unknown): void {
  const storageKey = prefix + key;
  const serialized = typeof value === 'string' ? value : serialize(value);

  if (encryptionKey) {
    storageAdapter.setItem(storageKey, encrypt(serialized, encryptionKey));
  } else {
    storageAdapter.setItem(storageKey, serialized);
  }

  notifySubscribers(key, value);
}

export function syncFromStorage(key: string): unknown {
  const storageKey = prefix + key;
  let value = storageAdapter.getItem(storageKey);

  if (!value) return undefined;

  if (encryptionKey) {
    value = decrypt(value, encryptionKey);
  }

  return deserialize(value);
}

export function removeFromStorage(key: string): void {
  const storageKey = prefix + key;
  storageAdapter.removeItem(storageKey);
}

export function clearStorage(): void {
  storageAdapter.clear();
}

export function enableEncryption(key: string): void {
  encryptionKey = key;
}

function serialize(value: unknown): string {
  return JSON.stringify(value);
}

function deserialize(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function encrypt(data: string, _key: string): string {
  return btoa(data);
}

function decrypt(data: string, _key: string): string {
  return atob(data);
}

function handleStorageChange(event: StorageEvent): void {
  if (!event.key) return;
  const key = event.key.startsWith(prefix) ? event.key.slice(prefix.length) : event.key;
  const value = event.newValue ? deserialize(event.newValue) : undefined;
  notifySubscribers(key, value);
}

function notifySubscribers(key: string, value: unknown): void {
  for (const subscriber of subscribers) {
    subscriber(key, value);
  }
}

export function subscribeToStorageChanges(callback: (key: string, value: unknown) => void): () => void {
  subscribers.push(callback);
  return () => {
    const idx = subscribers.indexOf(callback);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}

export function setStorageType(type: 'local' | 'session'): void {
  if (typeof window === 'undefined') return;

  if (type === 'session') {
    storageAdapter = new SessionStorageAdapter();
  } else {
    storageAdapter = new LocalStorageAdapter();
  }
}

export function getStorageAdapter(): StorageAdapter {
  return storageAdapter;
}