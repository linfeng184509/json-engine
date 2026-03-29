import type {
  Store,
  StoreConfig,
  StoreModuleConfig,
  GetterDefinition,
  ActionDefinition,
} from '../types/store';

const stores = new Map<string, Store>();

export function createStore(config: StoreConfig | Record<string, StoreModuleConfig>): Store[] {
  const modules = config.modules || (config as Record<string, StoreModuleConfig>);
  const createdStores: Store[] = [];

  for (const [id, moduleConfig] of Object.entries(modules)) {
    const store = createStoreModule(id, moduleConfig as StoreModuleConfig);
    stores.set(id, store);
    createdStores.push(store);
  }

  return createdStores;
}

export function createStoreModule(id: string, config: StoreModuleConfig): Store {
  const state: Record<string, unknown> = {};

  if (config.state) {
    for (const [key, value] of Object.entries(config.state)) {
      state[key] = value;
    }
  }

  const getters: Record<string, () => unknown> = {};
  if (config.getters) {
    for (const [name, getterDef] of Object.entries(config.getters)) {
      getters[name] = createGetterFunction(getterDef, state);
    }
  }

  const actions: Record<string, (...args: unknown[]) => unknown> = {};
  if (config.actions) {
    for (const [name, actionDef] of Object.entries(config.actions)) {
      actions[name] = createActionFunction(actionDef, state, getters);
    }
  }

  const store: Store = {
    $id: id,
    $state: state,
    $patch: (partial) => {
      Object.assign(store.$state, partial);
    },
    $reset: () => {
      if (config.state) {
        for (const [key, value] of Object.entries(config.state)) {
          store.$state[key] = value;
        }
      }
    },
    $subscribe: (_callback) => {
      return () => {};
    },
    $onAction: (_callback) => {
      return () => {};
    },
  };

  for (const [name, action] of Object.entries(actions)) {
    (store as Record<string, unknown>)[name] = action;
  }

  for (const [name, getter] of Object.entries(getters)) {
    Object.defineProperty(store, name, {
      get: getter,
      enumerable: true,
    });
  }

  return store;
}

function createGetterFunction(
  getterDef: GetterDefinition,
  state: Record<string, unknown>
): () => unknown {
  return () => {
    const fn = new Function('state', `${getterDef.body}`);
    return fn(state);
  };
}

function createActionFunction(
  actionDef: ActionDefinition,
  state: Record<string, unknown>,
  getters: Record<string, () => unknown>
): (...args: unknown[]) => unknown {
  return (...args: unknown[]) => {
    const fn = new Function('state', 'getters', ...(actionDef.params || []), `${actionDef.body}`);
    return fn(state, getters, ...args);
  };
}

export function registerModule(name: string, module: StoreModuleConfig): Store {
  if (stores.has(name)) {
    throw new Error(`Store module "${name}" already exists`);
  }
  const store = createStoreModule(name, module);
  stores.set(name, store);
  return store;
}

export function getModule(name: string): Store | undefined {
  return stores.get(name);
}

export function getAllStores(): Store[] {
  return Array.from(stores.values());
}

export function clearStores(): void {
  stores.clear();
}