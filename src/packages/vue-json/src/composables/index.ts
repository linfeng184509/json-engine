import { ref, shallowRef, type Ref, type Component } from 'vue';
import type { VueJsonSchemaInput, UseVueJsonOptions, ParsedSchema } from '../types';
import { parseSchema } from '../parser';
import { createComponent, clearComponentCache } from '../runtime/component-factory';
import { removeStyles } from '../runtime/style-injector';

export {
  useCoreScope,
  createCoreScope,
  getCoreScope,
  setCoreScope,
  registerGlobalComponents,
  getGlobalComponents,
} from './use-core-scope';
export type {
  CoreScope,
  CoreScopeAuth,
  CoreScopeI18n,
  CoreScopeStorage,
  CoreScopeApi,
  CoreScopeWS,
  CoreScopeLoader,
  CoreScopeRouter,
} from './use-core-scope';

export interface UseVueJsonReturn {
  component: Ref<Component | null>;
  schema: Ref<ParsedSchema | null>;
  parse: (input: VueJsonSchemaInput) => void;
  error: Ref<Error | null>;
  isLoading: Ref<boolean>;
}

export function useVueJson(options: UseVueJsonOptions = {}): UseVueJsonReturn {
  const { onError, cache = true } = options;

  const component = shallowRef<Component | null>(null);
  const schema = ref<ParsedSchema | null>(null);
  const error = ref<Error | null>(null);
  const isLoading = ref(false);

  const parse = (input: VueJsonSchemaInput): void => {
    isLoading.value = true;
    error.value = null;

    try {
      const parseResult = parseSchema(input);

      if (!parseResult.success || !parseResult.data) {
        const errorMsg = parseResult.errors?.map((e) => e.message).join('; ') || 'Parse failed';
        throw new Error(errorMsg);
      }

      schema.value = parseResult.data;

      const createdComponent = createComponent(input, { cache });
      component.value = createdComponent;

      if (parseResult.warnings && parseResult.warnings.length > 0) {
        console.warn('[vue-json-engine] Parse warnings:', parseResult.warnings);
      }
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      component.value = null;
      schema.value = null;
      onError?.(error.value);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    component: component as Ref<Component | null>,
    schema: schema as Ref<ParsedSchema | null>,
    parse,
    error: error as Ref<Error | null>,
    isLoading: isLoading as Ref<boolean>,
  };
}

export interface UseJsonComponentOptions {
  cache?: boolean;
}

export interface UseJsonComponentReturn {
  create: (input: VueJsonSchemaInput) => Component | null;
  clearCache: () => void;
}

export function useJsonComponent(options: UseJsonComponentOptions = {}): UseJsonComponentReturn {
  const { cache = true } = options;

  const create = (input: VueJsonSchemaInput): Component | null => {
    try {
      return createComponent(input, { cache });
    } catch (error) {
      console.error('[vue-json-engine] Component creation failed:', error);
      return null;
    }
  };

  const clearCacheFn = (): void => {
    clearComponentCache();
  };

  return {
    create,
    clearCache: clearCacheFn,
  };
}

export interface UseJsonRendererOptions {
  componentId?: string;
}

export interface UseJsonRendererReturn {
  destroy: () => void;
}

export function useJsonRenderer(
  component: Ref<Component | null>,
  options: UseJsonRendererOptions = {}
): UseJsonRendererReturn {
  const { componentId } = options;

  const destroy = (): void => {
    component.value = null;
    if (componentId) {
      removeStyles(componentId);
    }
  };

  return {
    destroy,
  };
}