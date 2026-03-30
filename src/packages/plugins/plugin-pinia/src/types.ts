export interface PiniaPluginConfig {
  persist?: boolean;
  storage?: 'localStorage' | 'sessionStorage';
  key?: string;
}

export interface StoreDefinition {
  name: string;
  state?: Record<string, unknown>;
  getters?: Record<string, unknown>;
  actions?: Record<string, unknown>;
}

export interface CoreScopeStore {
  $store: Map<string, unknown>;
  useStore: <T = unknown>(name: string) => T;
  registerStore: (definition: StoreDefinition) => void;
}
