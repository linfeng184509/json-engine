import type { StateDefinition } from './schema';

export interface GetterDefinition {
  type: 'function';
  params?: string[];
  body: string;
  deps?: string[];
}

export interface ActionDefinition {
  type: 'function';
  params?: string[];
  body: string;
  deps?: string[];
}

export interface StoreModuleConfig {
  id: string;
  state?: StateDefinition;
  getters?: Record<string, GetterDefinition>;
  actions?: Record<string, ActionDefinition>;
}

export interface StoreConfig {
  modules?: Record<string, StoreModuleConfig>;
}

export type Store = {
  $id: string;
  $state: Record<string, unknown>;
  $patch: (state: Partial<Record<string, unknown>>) => void;
  $reset: () => void;
  $subscribe: (callback: (state: Record<string, unknown>, type: string) => void) => () => void;
  $onAction: (callback: (action: { name: string; store: Store; args: unknown[] }) => void) => () => void;
};

export type DefineStoreOptions = {
  id: string;
  state: () => Record<string, unknown>;
  getters?: Record<string, (state: Record<string, unknown>) => unknown>;
  actions?: Record<string, (...args: unknown[]) => unknown>;
};