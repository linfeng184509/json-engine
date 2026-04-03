import type { SchemaLoadResult, SchemaLoadOptions } from '../runtime/schema-loader';
import type { Component } from 'vue';
export declare function registerGlobalComponents(components: Record<string, Component>): void;
export declare function getGlobalComponents(): Record<string, Component>;
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
export declare function createCoreScope(): CoreScope;
export declare function getCoreScope(): CoreScope;
export declare function setCoreScope(scope: CoreScope): void;
export declare function useCoreScope(): CoreScope;
//# sourceMappingURL=use-core-scope.d.ts.map