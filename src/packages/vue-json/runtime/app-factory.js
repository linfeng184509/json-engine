import { SchemaValidationError } from '../types/app';
import { createParserCache } from '@json-engine/core-engine';
const schemaCache = createParserCache({
    enabled: true,
    maxSize: 50,
    ttl: 5 * 60 * 1000,
});
function hasImportReferences(schema) {
    if ('$import' in schema)
        return true;
    for (const value of Object.values(schema)) {
        if (typeof value === 'object' && value !== null && hasImportReferences(value)) {
            return true;
        }
    }
    return false;
}
export async function resolveImports(schema) {
    const resolved = { ...schema };
    if ('$import' in resolved) {
        const importPath = resolved.$import;
        const imported = await loadSchema(importPath);
        delete resolved.$import;
        // Merge imported schema, with current schema taking precedence
        const merged = { ...imported, ...resolved };
        Object.assign(resolved, merged);
    }
    // Recursively resolve imports in nested objects
    for (const [key, value] of Object.entries(resolved)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            resolved[key] = await resolveImports(value);
        }
    }
    return resolved;
}
export function isSchemaWithImports(schema) {
    return hasImportReferences(schema);
}
export async function loadSchema(source) {
    if (typeof source === 'object' && !isString(source)) {
        validateSchema(source);
        return source;
    }
    const cached = schemaCache.get(source);
    if (cached) {
        return cached;
    }
    let schema;
    if (isUrl(source)) {
        const response = await fetch(source);
        if (!response.ok) {
            throw new Error(`Failed to load schema from ${source}: ${response.statusText}`);
        }
        schema = await response.json();
    }
    else {
        throw new Error(`Unsupported schema source: ${source}`);
    }
    validateSchema(schema);
    cacheSchema(source, schema);
    return schema;
}
export function validateSchema(schema) {
    if (!schema || typeof schema !== 'object') {
        throw new SchemaValidationError('Schema must be an object');
    }
    const s = schema;
    if (!s.name || typeof s.name !== 'string') {
        throw new SchemaValidationError('Schema must have a "name" field of type string');
    }
    if (!s.root && !s.router && !s.stores) {
        throw new SchemaValidationError('Schema must have at least one of: "root", "router", "stores"');
    }
    return true;
}
export function cacheSchema(url, schema) {
    schemaCache.set(url, schema);
}
export function clearSchemaCache(url) {
    if (url) {
        schemaCache.delete(url);
    }
    else {
        schemaCache.clear();
    }
}
export function getCachedSchema(url) {
    return schemaCache.get(url);
}
function isString(value) {
    return typeof value === 'string';
}
function isUrl(source) {
    try {
        new URL(source);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=app-factory.js.map