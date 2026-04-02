import type { Component } from 'vue';
import type { VueJsonSchemaInput } from '../types';
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
export declare class SchemaLoaderImpl {
    private schemaCache;
    load(path: string, options?: SchemaLoadOptions): Promise<SchemaLoadResult>;
    clearCache(): void;
    preload(paths: string[], options?: SchemaLoadOptions): Promise<SchemaLoadResult[]>;
    getCached(path: string): CachedSchema | undefined;
    hasCached(path: string): boolean;
    private fetchSchema;
}
export declare function createSchemaLoader(): SchemaLoaderImpl;
export declare function getSchemaLoader(): SchemaLoaderImpl;
export declare function setSchemaLoader(loader: SchemaLoaderImpl): void;
export declare function loadComponent(path: string, options?: SchemaLoadOptions): Promise<SchemaLoadResult>;
export declare function clearSchemaLoaderCache(): void;
export declare function preloadSchemas(paths: string[], options?: SchemaLoadOptions): Promise<SchemaLoadResult[]>;
export {};
//# sourceMappingURL=schema-loader.d.ts.map