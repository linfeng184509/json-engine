import type { VueJsonSchemaInput } from '@json-engine/vue-json';

const schemaModules = import.meta.glob<VueJsonSchemaInput>('./schemas/**/*.json', { eager: false });

interface SchemaCacheEntry {
  schema: VueJsonSchemaInput;
  jsonText: string;
}

const cache: Record<string, SchemaCacheEntry> = {};

export function hasSchema(path: string): boolean {
  return schemaModules[path] !== undefined;
}

export async function loadSchema(path: string): Promise<VueJsonSchemaInput> {
  if (cache[path]) {
    return cache[path].schema;
  }

  const loader = schemaModules[path];
  if (!loader) {
    throw new Error(`Schema not found in registry: ${path}`);
  }

  const schema = await loader();
  cache[path] = {
    schema,
    jsonText: JSON.stringify(schema, null, 2),
  };

  return schema;
}

export function getCachedJsonText(path: string): string | null {
  return cache[path]?.jsonText || null;
}

export async function preloadSchemas(paths: string[]): Promise<void> {
  await Promise.all(paths.map(p => loadSchema(p)));
}

export function getAllSchemaPaths(): string[] {
  return Object.keys(schemaModules);
}