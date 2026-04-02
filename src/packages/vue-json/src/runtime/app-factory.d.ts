import type { VueJsonAppSchema } from '../types/app';
export declare function resolveImports(schema: Record<string, unknown>): Promise<Record<string, unknown>>;
export declare function isSchemaWithImports(schema: Record<string, unknown>): boolean;
export declare function loadSchema(source: string | object): Promise<VueJsonAppSchema>;
export declare function validateSchema(schema: unknown): schema is VueJsonAppSchema;
export declare function cacheSchema(url: string, schema: VueJsonAppSchema): void;
export declare function clearSchemaCache(url?: string): void;
export declare function getCachedSchema(url: string): VueJsonAppSchema | undefined;
//# sourceMappingURL=app-factory.d.ts.map