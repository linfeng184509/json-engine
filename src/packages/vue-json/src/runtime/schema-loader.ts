import type { Component } from 'vue';
import type { VueJsonSchemaInput } from '../types';
import { parseSchema } from '../parser';
import { createComponentCreator } from './component-creator';
import { SchemaParseError } from '../utils/error';

export interface SchemaLoadResult {
  success: boolean;
  component?: Component;
  error?: Error;
  schema?: VueJsonSchemaInput;
}

export interface SchemaLoadOptions {
  cache?: boolean;
  extraComponents?: Record<string, Component>;
  injectStyles?: boolean;
  debug?: boolean;
}

interface CachedSchema {
  schema: VueJsonSchemaInput;
  component?: Component;
}

export class SchemaLoaderImpl {
  private schemaCache: Map<string, CachedSchema> = new Map();

  async load(path: string, options: SchemaLoadOptions = {}): Promise<SchemaLoadResult> {
    const { cache = true, extraComponents = {}, injectStyles = true, debug = false } = options;

    try {
      if (cache && this.schemaCache.has(path)) {
        const cached = this.schemaCache.get(path)!;
        if (cached.component) {
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
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { success: false, error };
    }
  }

  clearCache(): void {
    this.schemaCache.clear();
  }

  async preload(paths: string[], options: SchemaLoadOptions = {}): Promise<SchemaLoadResult[]> {
    const results = await Promise.all(
      paths.map((path) => this.load(path, { ...options, cache: true }))
    );
    return results;
  }

  getCached(path: string): CachedSchema | undefined {
    return this.schemaCache.get(path);
  }

  hasCached(path: string): boolean {
    return this.schemaCache.has(path);
  }

  private async fetchSchema(path: string): Promise<VueJsonSchemaInput> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch schema from ${path}: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<VueJsonSchemaInput>;
  }
}

let globalSchemaLoader: SchemaLoaderImpl | null = null;

export function createSchemaLoader(): SchemaLoaderImpl {
  if (!globalSchemaLoader) {
    globalSchemaLoader = new SchemaLoaderImpl();
  }
  return globalSchemaLoader;
}

export function getSchemaLoader(): SchemaLoaderImpl {
  return createSchemaLoader();
}

export function setSchemaLoader(loader: SchemaLoaderImpl): void {
  globalSchemaLoader = loader;
}

export async function loadComponent(
  path: string,
  options: SchemaLoadOptions = {}
): Promise<SchemaLoadResult> {
  return getSchemaLoader().load(path, options);
}

export function clearSchemaLoaderCache(): void {
  getSchemaLoader().clearCache();
}

export async function preloadSchemas(
  paths: string[],
  options: SchemaLoadOptions = {}
): Promise<SchemaLoadResult[]> {
  return getSchemaLoader().preload(paths, options);
}