import type { SchemaLoadResult, SchemaLoadOptions } from '../runtime/schema-loader';
import { getSchemaLoader } from '../runtime/schema-loader';
import type { Component } from 'vue';

let globalExtraComponents: Record<string, Component> = {};

export function registerGlobalComponents(components: Record<string, Component>): void {
  globalExtraComponents = { ...globalExtraComponents, ...components };
}

export function getGlobalComponents(): Record<string, Component> {
  return globalExtraComponents;
}

export interface CoreScopeAuth {
  has: (permission: string) => boolean;
  hasAny: (permissions: string[]) => boolean;
  hasAll: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  canAccessPage: (page: string) => boolean;
  getUserInfo: () => unknown;
}

export interface CoreScopeI18n {
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: string;
  setLocale: (locale: string) => void;
  getLocale: () => string;
}

export interface CoreScopeStorage {
  get: <T = unknown>(key: string) => T | null;
  set: <T = unknown>(key: string, value: T, ttl?: number) => void;
  remove: (key: string) => void;
  has: (key: string) => boolean;
}

export interface CoreScopeApi {
  get: (url: string, options?: Record<string, unknown>) => Promise<unknown>;
  post: (url: string, data?: unknown, options?: Record<string, unknown>) => Promise<unknown>;
  put: (url: string, data?: unknown, options?: Record<string, unknown>) => Promise<unknown>;
  delete: (url: string, options?: Record<string, unknown>) => Promise<unknown>;
}

export interface CoreScopeWS {
  send: (topic: string, data: unknown) => void;
  subscribe: (topic: string, handler: (data: unknown) => void) => void;
  unsubscribe: (topic: string) => void;
  connect: () => void;
  disconnect: () => void;
  isConnected: () => boolean;
}

export interface CoreScopeLoader {
  load: (path: string, options?: SchemaLoadOptions) => Promise<SchemaLoadResult>;
  clearCache: () => void;
  preload: (paths: string[], options?: SchemaLoadOptions) => Promise<SchemaLoadResult[]>;
}

export interface CoreScopeRouter {
  push: (path: string) => void;
  replace: (path: string) => void;
  go: (n: number) => void;
  back: () => void;
  forward: () => void;
  getCurrentRoute: () => string;
}

export interface CoreScope {
  _auth: CoreScopeAuth;
  _i18n: CoreScopeI18n;
  _storage: CoreScopeStorage;
  _api: CoreScopeApi;
  _ws: CoreScopeWS;
  _loader: CoreScopeLoader;
  _router: CoreScopeRouter;
  _pinia: Map<string, unknown>;
}

export function createCoreScope(): CoreScope {
  const auth: CoreScopeAuth = {
    has: () => false,
    hasAny: () => false,
    hasAll: () => false,
    hasRole: () => false,
    canAccessPage: () => true,
    getUserInfo: () => null,
  };

  const i18n: CoreScopeI18n = {
    t: (key: string) => key,
    locale: 'en',
    setLocale: () => {},
    getLocale: () => 'en',
  };

  const storage: CoreScopeStorage = {
    get: () => null,
    set: () => {},
    remove: () => {},
    has: () => false,
  };

  const api: CoreScopeApi = {
    get: async (url: string, options?: Record<string, unknown>) => {
      const response = await fetch(url, { method: 'GET', ...options });
      return response.json();
    },
    post: async (url: string, data?: unknown, options?: Record<string, unknown>) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
      return response.json();
    },
    put: async (url: string, data?: unknown, options?: Record<string, unknown>) => {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
      return response.json();
    },
    delete: async (url: string, options?: Record<string, unknown>) => {
      const response = await fetch(url, { method: 'DELETE', ...options });
      return response.json();
    },
  };

  const ws: CoreScopeWS = {
    send: () => console.warn('[CoreScope] WebSocket not configured'),
    subscribe: () => console.warn('[CoreScope] WebSocket not configured'),
    unsubscribe: () => console.warn('[CoreScope] WebSocket not configured'),
    connect: () => console.warn('[CoreScope] WebSocket not configured'),
    disconnect: () => console.warn('[CoreScope] WebSocket not configured'),
    isConnected: () => false,
  };

  const schemaLoader = getSchemaLoader();
  const loader: CoreScopeLoader = {
    load: (path, options) => schemaLoader.load(path, options),
    clearCache: () => schemaLoader.clearCache(),
    preload: (paths, options) => schemaLoader.preload(paths, options),
  };

  const router: CoreScopeRouter = {
    push: (path: string) => { window.location.hash = path; },
    replace: (path: string) => { window.location.replace(`#${path}`); },
    go: (n: number) => window.history.go(n),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    getCurrentRoute: () => window.location.hash.slice(1) || '/',
  };

  return {
    _auth: auth,
    _i18n: i18n,
    _storage: storage,
    _api: api,
    _ws: ws,
    _loader: loader,
    _router: router,
    _pinia: new Map(),
  };
}

let globalCoreScope: CoreScope | null = null;

export function getCoreScope(): CoreScope {
  if (!globalCoreScope) {
    globalCoreScope = createCoreScope();
  }
  return globalCoreScope;
}

export function setCoreScope(scope: CoreScope): void {
  globalCoreScope = scope;
}

export function useCoreScope(): CoreScope {
  return getCoreScope();
}