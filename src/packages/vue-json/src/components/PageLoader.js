import { defineComponent, ref, shallowRef, watch, h, } from 'vue';
import { getSchemaLoader } from '../runtime/schema-loader';
import { getGlobalComponents } from '../composables/use-core-scope';
import { getLogger } from '../utils/logger';
export const PageLoader = defineComponent({
    name: 'PageLoader',
    props: {
        schemaPath: {
            type: String,
            required: true,
        },
        layout: {
            type: String,
            default: null,
        },
        cache: {
            type: Boolean,
            default: true,
        },
        extraComponents: {
            type: Object,
            default: () => ({}),
        },
    },
    slots: {},
    setup(props, { slots }) {
        const logger = getLogger('PageLoader');
        logger.debug('setup() called, schemaPath: %s, cache: %s', props.schemaPath, props.cache);
        const isLoading = ref(true);
        const error = ref(null);
        const pageComponent = shallowRef(null);
        const layoutComponent = shallowRef(null);
        const loadResult = shallowRef(null);
        const schemaLoader = getSchemaLoader();
        async function loadSchema() {
            if (!props.schemaPath) {
                isLoading.value = false;
                error.value = null;
                pageComponent.value = null;
                layoutComponent.value = null;
                return;
            }
            logger.debug('loadSchema() called, schemaPath: %s', props.schemaPath);
            isLoading.value = true;
            error.value = null;
            pageComponent.value = null;
            layoutComponent.value = null;
            const globalComponents = getGlobalComponents();
            const mergedComponents = { ...globalComponents, ...props.extraComponents };
            const options = {
                cache: props.cache,
                extraComponents: mergedComponents,
            };
            try {
                const result = await schemaLoader.load(props.schemaPath, options);
                logger.debug('load() result: schemaPath=%s, success=%s, hasComponent=%s', props.schemaPath, result.success, !!result.component);
                loadResult.value = result;
                if (result.success && result.component) {
                    pageComponent.value = result.component;
                    logger.debug('Component assigned successfully');
                }
                else {
                    error.value = result.error || new Error('Unknown error loading schema');
                    logger.error('Failed to load schema: %s', props.schemaPath, result.error);
                }
                if (props.layout) {
                    const layoutResult = await schemaLoader.load(props.layout, options);
                    if (layoutResult.success && layoutResult.component) {
                        layoutComponent.value = layoutResult.component;
                    }
                    else {
                        error.value = layoutResult.error || new Error('Unknown error loading layout');
                    }
                }
            }
            catch (e) {
                error.value = e instanceof Error ? e : new Error(String(e));
                logger.error('Exception during load:', e);
            }
            isLoading.value = false;
            logger.debug('loadSchema() complete, isLoading: %s, hasError: %s', isLoading.value, !!error.value);
        }
        function retry() {
            loadSchema();
        }
        watch(() => [props.schemaPath, props.layout], (newVals, oldVals) => {
            if (newVals[0] !== oldVals?.[0] || newVals[1] !== oldVals?.[1]) {
                loadSchema();
            }
        });
        loadSchema();
        return () => {
            if (isLoading.value) {
                if (slots.loading) {
                    return slots.loading();
                }
                return h('div', { class: 'page-loader-loading' }, [
                    h('div', { class: 'page-loader-spinner' }),
                    h('span', 'Loading...'),
                ]);
            }
            if (error.value) {
                if (slots.error) {
                    return slots.error({ error: error.value, retry });
                }
                return h('div', { class: 'page-loader-error' }, [
                    h('div', { class: 'page-loader-error-icon' }, '!'),
                    h('h3', 'Load Failed'),
                    h('p', error.value.message),
                    h('button', { class: 'page-loader-retry-btn', onClick: retry }, 'Retry'),
                ]);
            }
            if (layoutComponent.value && pageComponent.value) {
                return h(layoutComponent.value, { pageContent: h(pageComponent.value) });
            }
            if (pageComponent.value) {
                if (slots.default) {
                    return slots.default();
                }
                return h(pageComponent.value);
            }
            return null;
        };
    },
});
export function createPageLoader() {
    return PageLoader;
}
export function createDefaultLoadingSpinner() {
    return h('div', { class: 'page-loader-loading' }, [
        h('div', { class: 'page-loader-spinner' }),
        h('span', 'Loading...'),
    ]);
}
export function createDefaultErrorUI(error, retry) {
    return h('div', { class: 'page-loader-error' }, [
        h('div', { class: 'page-loader-error-icon' }, '!'),
        h('h3', 'Load Failed'),
        h('p', error.message),
        h('button', { class: 'page-loader-retry-btn', onClick: retry }, 'Retry'),
    ]);
}
//# sourceMappingURL=PageLoader.js.map