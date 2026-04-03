import { getSchemaLoader } from '../runtime/schema-loader';
let globalExtraComponents = {};
export function registerGlobalComponents(components) {
    globalExtraComponents = { ...globalExtraComponents, ...components };
}
export function getGlobalComponents() {
    return globalExtraComponents;
}
export function createCoreScope() {
    const auth = {
        has: () => false,
        hasAny: () => false,
        hasAll: () => false,
        hasRole: () => false,
        canAccessPage: () => true,
        getUserInfo: () => null,
    };
    const i18n = {
        t: (key) => key,
        locale: 'en',
        setLocale: () => { },
        getLocale: () => 'en',
    };
    const storage = {
        get: () => null,
        set: () => { },
        remove: () => { },
        has: () => false,
    };
    const api = {
        get: async (url, options) => {
            const response = await fetch(url, { method: 'GET', ...options });
            return response.json();
        },
        post: async (url, data, options) => {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: data ? JSON.stringify(data) : undefined,
                ...options,
            });
            return response.json();
        },
        put: async (url, data, options) => {
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: data ? JSON.stringify(data) : undefined,
                ...options,
            });
            return response.json();
        },
        delete: async (url, options) => {
            const response = await fetch(url, { method: 'DELETE', ...options });
            return response.json();
        },
    };
    const ws = {
        send: () => console.warn('[CoreScope] WebSocket not configured'),
        subscribe: () => console.warn('[CoreScope] WebSocket not configured'),
        unsubscribe: () => console.warn('[CoreScope] WebSocket not configured'),
        connect: () => console.warn('[CoreScope] WebSocket not configured'),
        disconnect: () => console.warn('[CoreScope] WebSocket not configured'),
        isConnected: () => false,
    };
    const schemaLoader = getSchemaLoader();
    const loader = {
        load: (path, options) => schemaLoader.load(path, options),
        clearCache: () => schemaLoader.clearCache(),
        preload: (paths, options) => schemaLoader.preload(paths, options),
    };
    const router = {
        push: (path) => { window.location.hash = path; },
        replace: (path) => { window.location.replace(`#${path}`); },
        go: (n) => window.history.go(n),
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
let globalCoreScope = null;
export function getCoreScope() {
    if (!globalCoreScope) {
        globalCoreScope = createCoreScope();
    }
    return globalCoreScope;
}
export function setCoreScope(scope) {
    globalCoreScope = scope;
}
export function useCoreScope() {
    return getCoreScope();
}
//# sourceMappingURL=use-core-scope.js.map