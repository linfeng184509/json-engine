import type { Component } from 'vue';
import type { VueJsonSchemaInput } from '../types';
import { createParserCache } from '@json-engine/core-engine';
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
  private schemaCache = createParserCache({
    enabled: true,
    maxSize: 100,
    ttl: 10 * 60 * 1000,
  });

  async load(path: string, options: SchemaLoadOptions = {}): Promise<SchemaLoadResult> {
    const { cache = true, extraComponents = {}, injectStyles = true, debug = false } = options;

    console.log('[SchemaLoader] load() called:', { path, cache, hasExtraComponents: Object.keys(extraComponents).length });

    try {
      if (cache) {
        const cached = this.schemaCache.get<CachedSchema>(path);
        if (cached?.component) {
          console.log('[SchemaLoader] Returning cached component for:', path);
          return { success: true, component: cached.component, schema: cached.schema };
        }
      }

      console.log('[SchemaLoader] Fetching schema:', path);
      const schema = await this.fetchSchema(path);
      console.log('[SchemaLoader] Schema fetched, parsing:', path);

      const parseResult = parseSchema(schema);
      console.log('[SchemaLoader] Parse result:', { 
        path, 
        success: parseResult.success, 
        hasData: !!parseResult.data,
        errorCount: parseResult.errors?.length 
      });
      
      if (!parseResult.success || !parseResult.data) {
        const errors = parseResult.errors?.map((e) => e.message).join('; ') || 'Unknown parse error';
        const error = new SchemaParseError(path, errors);
        console.error('[SchemaLoader] Parse failed:', path, errors);
        return { success: false, error, schema };
      }

      console.log('[SchemaLoader] Creating component for:', path);
      const component = createComponentCreator(schema, {
        cache,
        injectStyles,
        debug,
        extraComponents,
      });
      console.log('[SchemaLoader] Component created:', { path, hasComponent: !!component });

      if (cache) {
        this.schemaCache.set(path, { schema, component });
      }

      return { success: true, component, schema };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[SchemaLoader] Exception:', path, error.message, error.stack);
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
    return this.schemaCache.get<CachedSchema>(path);
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