import { describe, it, expect } from 'vitest';
import { createPiniaInstance } from './runtime/pinia-factory';

describe('PiniaFactory', () => {
  it('should create pinia instance', () => {
    const pinia = createPiniaInstance({});
    expect(pinia).toHaveProperty('useStore');
    expect(pinia).toHaveProperty('registerStore');
    expect(pinia).toHaveProperty('getStore');
  });

  it('should register store', () => {
    const pinia = createPiniaInstance({});
    pinia.registerStore({
      name: 'user',
      state: { name: 'John', age: 30 },
    });

    const store = pinia.getStore('user');
    expect(store).toBeDefined();
  });

  it('should use store', () => {
    const pinia = createPiniaInstance({});
    pinia.registerStore({
      name: 'counter',
      state: { count: 0 },
    });

    const store = pinia.useStore<{ count: number }>('counter');
    expect(store.count).toBe(0);
  });

  it('should return empty object for non-existent store', () => {
    const pinia = createPiniaInstance({});
    const store = pinia.useStore('nonexistent');

    expect(store).toEqual({});
  });

  it('should include actions in store', () => {
    const pinia = createPiniaInstance({});
    pinia.registerStore({
      name: 'user',
      state: { name: 'John' },
      actions: {
        updateName(newName: string) {
          (this as { name: string }).name = newName;
        },
      },
    });

    const store = pinia.getStore<{ name: string; updateName: (n: string) => void }>('user');
    expect(typeof store?.updateName).toBe('function');
  });
});
