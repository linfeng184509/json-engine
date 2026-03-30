import { describe, it, expect, beforeEach, vi } from 'vitest';

const store: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((i: number) => Object.keys(store)[i] || null),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

import { createStorageInstance } from './runtime/storage-factory';

describe('StorageFactory', () => {
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    vi.clearAllMocks();
  });

  it('should create storage instance', () => {
    const storage = createStorageInstance({});
    expect(storage).toHaveProperty('get');
    expect(storage).toHaveProperty('set');
    expect(storage).toHaveProperty('remove');
    expect(storage).toHaveProperty('clear');
    expect(storage).toHaveProperty('has');
  });

  it('should set and get item', () => {
    const storage = createStorageInstance({});
    storage.set('key1', 'value1');

    expect(storage.get('key1')).toBe('value1');
  });

  it('should return null for non-existent key', () => {
    const storage = createStorageInstance({});
    expect(storage.get('nonexistent')).toBeNull();
  });

  it('should remove item', () => {
    const storage = createStorageInstance({});
    storage.set('key1', 'value1');
    storage.remove('key1');

    expect(storage.get('key1')).toBeNull();
  });

  it('should clear all items with prefix', () => {
    const storage = createStorageInstance({ prefix: 'test-' });
    storage.set('key1', 'value1');
    storage.set('key2', 'value2');
    storage.clear();

    expect(storage.get('key1')).toBeNull();
    expect(storage.get('key2')).toBeNull();
  });

  it('should check if key exists', () => {
    const storage = createStorageInstance({});
    storage.set('key1', 'value1');

    expect(storage.has('key1')).toBe(true);
    expect(storage.has('key2')).toBe(false);
  });

  it('should support TTL', () => {
    const storage = createStorageInstance({});
    storage.set('key1', 'value1', 1000);

    expect(storage.get('key1')).toBe('value1');
  });

  it('should use custom prefix', () => {
    const storage = createStorageInstance({ prefix: 'custom-' });
    storage.set('key1', 'value1');

    expect(storage.get('key1')).toBe('value1');
    expect(storage.has('key1')).toBe(true);
  });

  it('should store objects', () => {
    const storage = createStorageInstance({});
    const obj = { name: 'John', age: 30 };
    storage.set('user', obj);

    expect(storage.get('user')).toEqual(obj);
  });
});
