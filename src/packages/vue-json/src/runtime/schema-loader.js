import { createParserCache } from '@json-engine/core-engine';
import { parseSchema } from '../parser';
import { createComponentCreator } from './component-creator';
import { SchemaParseError } from '../utils/error';
export class SchemaLoaderImpl {
    schemaCache = createParserCache({
        enabled: true,
        maxSize: 100,
        ttl: 10 * 60 * 1000,
    });
    async load(path, options = {}) {
        const { cache = true, extraComponents = {}, injectStyles = true, debug = false } = options;
        try {
            if (cache) {
                const cached = this.schemaCache.get(path);
                if (cached?.component) {
                    return { success: true, component: cached.component, schema: cached.schema };
                }
            }
            const schema = await this.fetchSchema(path);
            const parseResult = parseSchema(schema);
            if (!parseResult.success || !parseResult.data) {
                const errors = parseResult.errors?.map((e) => e.message).join('; ') || 'Unknown parse error';
                const error = new SchemaParseError(path, errors);
                return { success: false, error, schema };
            }
            const component = createComponentCreator(schema, {
                cache,
                injectStyles,
                debug,
                extraComponents,
            });
            if (cache) {
                this.schemaCache.set(path, { schema, component });
            }
            return { success: true, component, schema };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            return { success: false, error };
        }
    }
    clearCache() {
        this.schemaCache.clear();
    }
    async preload(paths, options = {}) {
        const results = await Promise.all(paths.map((path) => this.load(path, { ...options, cache: true })));
        return results;
    }
    getCached(path) {
        return this.schemaCache.get(path);
    }
    hasCached(path) {
        return this.schemaCache.has(path);
    }
    async fetchSchema(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to fetch schema from ${path}: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
}
let globalSchemaLoader = null;
export function createSchemaLoader() {
    if (!globalSchemaLoader) {
        globalSchemaLoader = new SchemaLoaderImpl();
    }
    return globalSchemaLoader;
}
export function getSchemaLoader() {
    return createSchemaLoader();
}
export function setSchemaLoader(loader) {
    globalSchemaLoader = loader;
}
export async function loadComponent(path, options = {}) {
    return getSchemaLoader().load(path, options);
}
export function clearSchemaLoaderCache() {
    getSchemaLoader().clearCache();
}
export async function preloadSchemas(paths, options = {}) {
    return getSchemaLoader().preload(paths, options);
}
//# sourceMappingURL=schema-loader.js.map