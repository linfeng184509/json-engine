import { type Ref, type Component } from 'vue';
import type { VueJsonSchemaInput, UseVueJsonOptions, ParsedSchema } from '../types';
export { useCoreScope, createCoreScope, getCoreScope, setCoreScope, registerGlobalComponents, getGlobalComponents, } from './use-core-scope';
export type { CoreScope, CoreScopeAuth, CoreScopeI18n, CoreScopeStorage, CoreScopeApi, CoreScopeWS, CoreScopeLoader, CoreScopeRouter, } from './use-core-scope';
export interface UseVueJsonReturn {
    component: Ref<Component | null>;
    schema: Ref<ParsedSchema | null>;
    parse: (input: VueJsonSchemaInput) => void;
    error: Ref<Error | null>;
    isLoading: Ref<boolean>;
}
export declare function useVueJson(options?: UseVueJsonOptions): UseVueJsonReturn;
export interface UseJsonComponentOptions {
    cache?: boolean;
}
export interface UseJsonComponentReturn {
    create: (input: VueJsonSchemaInput) => Component | null;
    clearCache: () => void;
}
export declare function useJsonComponent(options?: UseJsonComponentOptions): UseJsonComponentReturn;
export interface UseJsonRendererOptions {
    componentId?: string;
}
export interface UseJsonRendererReturn {
    destroy: () => void;
}
export declare function useJsonRenderer(component: Ref<Component | null>, options?: UseJsonRendererOptions): UseJsonRendererReturn;
//# sourceMappingURL=index.d.ts.map