import type { PiniaPluginConfig, StoreDefinition } from '../types';

export interface PiniaInstance {
  useStore: <T = unknown>(name: string) => T;
  registerStore: (definition: StoreDefinition) => void;
  getStore: <T = unknown>(name: string) => T | undefined;
}

export function createPiniaInstance(_config: PiniaPluginConfig): PiniaInstance {
  const stores = new Map<string, unknown>();

  const registerStore = (definition: StoreDefinition) => {
    const store = {
      ...definition.state,
      ...definition.getters,
      ...definition.actions,
    };
    stores.set(definition.name, store);
    console.log(`[pinia] Registered store: ${definition.name}`);
  };

  const useStore = <T = unknown>(name: string): T => {
    const store = stores.get(name);
    if (!store) {
      console.warn(`[pinia] Store ${name} not found`);
    }
    return (store as T) || ({} as T);
  };

  const getStore = <T = unknown>(name: string): T | undefined => {
    return stores.get(name) as T | undefined;
  };

  return { useStore, registerStore, getStore };
}
