import { has, hasAny, hasAll, hasRole, canAccessPage } from '../runtime/permission-checker';
import { getFieldPermission, canReadField, canWriteField, isFieldHidden, isFieldPrivate } from '../runtime/field-permission';
import { t, setLocale, getLocale } from '../runtime/i18n-factory';
import { syncToStorage, syncFromStorage, removeFromStorage } from '../runtime/storage-factory';
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
  getFieldPermission: (page: string, field: string) => ReturnType<typeof getFieldPermission>;
  canReadField: (page: string, field: string) => boolean;
  canWriteField: (page: string, field: string) => boolean;
  isFieldHidden: (page: string, field: string) => boolean;
  isFieldPrivate: (page: string, field: string) => boolean;
}

export interface CoreScopeI18n {
  t: (key: string, params?: Record<string, string>) => string;
  locale: string;
  setLocale: (locale: string) => void;
  getLocale: () => string;
}

export interface CoreScopeStorage {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  remove: (key: string) => void;
  sync: (key: string, value: unknown) => void;
}

export interface CoreScopeApi {
  get: (url: string, options?: Record<string, unknown>) => Promise<unknown>;
  post: (url: string, data?: unknown, options?: Record<string, unknown>) => Promise<unknown>;
  put: (url: string, data?: unknown, options?: Record<string, unknown>) => Promise<unknown>;
  delete: (url: string, options?: Record<string, unknown>) => Promise<unknown>;
}

export interface CoreScopeWS {
  send: (channel: string, data: unknown) => void;
  subscribe: (channel: string, handler: (data: unknown) => void) => void;
  unsubscribe: (channel: string, handler: (data: unknown) => void) => void;
}

export interface CoreScopeLoader {
  load: (path: string, options?: SchemaLoadOptions) => Promise<SchemaLoadResult>;
  clearCache: () => void;
  preload: (paths: string[], options?: SchemaLoadOptions) => Promise<SchemaLoadResult[]>;
}

export interface CoreScopeRouter {
  push: (path: string) => void;
  replace: (path: string) => void;
  currentRoute: string;
  go: (n: number) => void;
  back: () => void;
  forward: () => void;
}

export interface CoreScope {
  _auth: CoreScopeAuth;
  _i18n: CoreScopeI18n;
  _storage: CoreScopeStorage;
  _api: CoreScopeApi;
  _ws: CoreScopeWS;
  _loader: CoreScopeLoader;
  _router: CoreScopeRouter;
}

function getCurrentHashRoute(): string {
  return window.location.hash.slice(1) || '/';
}

function setHashRoute(path: string, replace: boolean = false): void {
  if (replace) {
    window.location.replace(`#${path}`);
  } else {
    window.location.hash = path;
  }
}

export function createCoreScope(): CoreScope {
  const auth: CoreScopeAuth = {
    has,
    hasAny,
    hasAll,
    hasRole,
    canAccessPage,
    getFieldPermission,
    canReadField,
    canWriteField,
    isFieldHidden,
    isFieldPrivate,
  };

  const i18n: CoreScopeI18n = {
    t,
    locale: getLocale(),
    setLocale,
    getLocale,
  };

  const storage: CoreScopeStorage = {
    get: syncFromStorage,
    set: syncToStorage,
    remove: removeFromStorage,
    sync: syncToStorage,
  };

  const api: CoreScopeApi = {
    get: async (url: string, options?: Record<string, unknown>) => {
      const token = storage.get('token');
      const headers: Record<string, string> = {
        ...(options?.headers as Record<string, string> || {}),
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(url, { method: 'GET', ...options, headers });
      return response.json();
    },
    post: async (url: string, data?: unknown, options?: Record<string, unknown>) => {
      const token = storage.get('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string> || {}),
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
      return response.json();
    },
    put: async (url: string, data?: unknown, options?: Record<string, unknown>) => {
      const token = storage.get('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string> || {}),
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
      return response.json();
    },
    delete: async (url: string, options?: Record<string, unknown>) => {
      const token = storage.get('token');
      const headers: Record<string, string> = {
        ...(options?.headers as Record<string, string> || {}),
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(url, { method: 'DELETE', ...options, headers });
      return response.json();
    },
  };

  const ws: CoreScopeWS = {
    send: (_channel: string, _data: unknown) => {
      console.warn('[CoreScope] WebSocket send not configured');
    },
    subscribe: (_channel: string, _handler: (data: unknown) => void) => {
      console.warn('[CoreScope] WebSocket subscribe not configured');
    },
    unsubscribe: (_channel: string, _handler: (data: unknown) => void) => {
      console.warn('[CoreScope] WebSocket unsubscribe not configured');
    },
  };

  const schemaLoader = getSchemaLoader();
  const loader: CoreScopeLoader = {
    load: (path: string, options?: SchemaLoadOptions) => schemaLoader.load(path, options),
    clearCache: () => schemaLoader.clearCache(),
    preload: (paths: string[], options?: SchemaLoadOptions) => schemaLoader.preload(paths, options),
  };

  const router: CoreScopeRouter = {
    push: (path: string) => setHashRoute(path, false),
    replace: (path: string) => setHashRoute(path, true),
    currentRoute: getCurrentHashRoute(),
    go: (n: number) => window.history.go(n),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
  };

  return {
    _auth: auth,
    _i18n: i18n,
    _storage: storage,
    _api: api,
    _ws: ws,
    _loader: loader,
    _router: router,
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