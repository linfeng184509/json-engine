import { createParserCache } from '@json-engine/core-engine';
import { parseSchema } from '../parser';
import { createComponentCreator } from './component-creator';
import { SchemaParseError } from '../utils/error';
import { getLogger } from '../utils/logger';
export class SchemaLoaderImpl {
    schemaCache = createParserCache({
        enabled: true,
        maxSize: 100,
        ttl: 10 * 60 * 1000,
    });
    registryLoader;
    setRegistryLoader(loader) {
        this.registryLoader = loader;
    }
    isLocalSchema(path) {
        return path.startsWith('./schemas/') && this.registryLoader !== undefined;
    }
    async load(path, options = {}) {
        const { cache = true, extraComponents = {}, injectStyles = true, debug = false } = options;
        const logger = getLogger('SchemaLoader');
        logger.debug('load() called: path=%s, cache=%s', path, cache);
        if (!path || typeof path !== 'string') {
            const error = new Error('Invalid schema path: path must be a non-empty string');
            logger.error('Invalid path: %s', path);
            return { success: false, error };
        }
        try {
            if (cache) {
                const cached = this.schemaCache.get(path);
                if (cached?.component) {
                    logger.debug('Returning cached component for: %s', path);
                    return { success: true, component: cached.component, schema: cached.schema };
                }
            }
            let schema;
            if (this.isLocalSchema(path)) {
                logger.debug('Loading from registry: %s', path);
                schema = await this.registryLoader(path);
            }
            else {
                logger.debug('Fetching schema: %s', path);
                schema = await this.fetchSchema(path);
            }
            const parseResult = parseSchema(schema);
            if (!parseResult.success || !parseResult.data) {
                const errors = parseResult.errors?.map((e) => e.message).join('; ') || 'Unknown parse error';
                const error = new SchemaParseError(path, errors);
                logger.error('Parse failed: %s - %s', path, errors);
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
            logger.error('Exception: %s - %s', path, error.message);
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
    getCachedJsonText(path) {
        const cached = this.schemaCache.get(path);
        if (cached?.schema) {
            return JSON.stringify(cached.schema, null, 2);
        }
        return null;
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