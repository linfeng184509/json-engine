import { ref, shallowRef } from 'vue';
import { parseSchema } from '../parser';
import { createComponent, clearComponentCache } from '../runtime/component-factory';
import { removeStyles } from '../runtime/style-injector';
export { useCoreScope, createCoreScope, getCoreScope, setCoreScope, registerGlobalComponents, getGlobalComponents, } from './use-core-scope';
export function useVueJson(options = {}) {
    const { onError, cache = true } = options;
    const component = shallowRef(null);
    const schema = ref(null);
    const error = ref(null);
    const isLoading = ref(false);
    const parse = (input) => {
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
        }
        catch (e) {
            error.value = e instanceof Error ? e : new Error(String(e));
            component.value = null;
            schema.value = null;
            onError?.(error.value);
        }
        finally {
            isLoading.value = false;
        }
    };
    return {
        component: component,
        schema: schema,
        parse,
        error: error,
        isLoading: isLoading,
    };
}
export function useJsonComponent(options = {}) {
    const { cache = true } = options;
    const create = (input) => {
        try {
            return createComponent(input, { cache });
        }
        catch (error) {
            console.error('[vue-json-engine] Component creation failed:', error);
            return null;
        }
    };
    const clearCacheFn = () => {
        clearComponentCache();
    };
    return {
        create,
        clearCache: clearCacheFn,
    };
}
export function useJsonRenderer(component, options = {}) {
    const { componentId } = options;
    const destroy = () => {
        component.value = null;
        if (componentId) {
            removeStyles(componentId);
        }
    };
    return {
        destroy,
    };
}
//# sourceMappingURL=index.js.map