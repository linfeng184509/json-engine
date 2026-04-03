import {
  defineComponent,
  ref,
  shallowRef,
  watch,
  type Component,
  type PropType,
  h,
  type VNode,
  type SlotsType,
} from 'vue';
import type { SchemaLoadResult, SchemaLoadOptions } from '../runtime/schema-loader';
import { getSchemaLoader } from '../runtime/schema-loader';
import { getGlobalComponents } from '../composables/use-core-scope';

export interface PageLoaderProps {
  schemaPath: string;
  layout?: string;
  cache?: boolean;
  extraComponents?: Record<string, Component>;
}

export const PageLoader = defineComponent({
  name: 'PageLoader',
  props: {
    schemaPath: {
      type: String as PropType<string>,
      required: true,
    },
    layout: {
      type: String as PropType<string>,
      default: null,
    },
    cache: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    extraComponents: {
      type: Object as PropType<Record<string, Component>>,
      default: () => ({}),
    },
  },
  slots: {} as SlotsType<{
    loading?: () => VNode[];
    error?: (props: { error: Error; retry: () => void }) => VNode[];
    default?: () => VNode[];
  }>,
  setup(props, { slots }) {
    console.log('[PageLoader] setup() called, schemaPath:', props.schemaPath, 'cache:', props.cache);
    const isLoading = ref(true);
    const error = ref<Error | null>(null);
    const pageComponent = shallowRef<Component | null>(null);
    const layoutComponent = shallowRef<Component | null>(null);
    const loadResult = shallowRef<SchemaLoadResult | null>(null);

    const schemaLoader = getSchemaLoader();

    async function loadSchema(): Promise<void> {
      console.log('[PageLoader] loadSchema() called, schemaPath:', props.schemaPath);
      isLoading.value = true;
      error.value = null;
      pageComponent.value = null;
      layoutComponent.value = null;

      const globalComponents = getGlobalComponents();
      const mergedComponents: Record<string, Component> = { ...globalComponents, ...props.extraComponents };

      const options: SchemaLoadOptions = {
        cache: props.cache,
        extraComponents: mergedComponents,
      };

      try {
        const result = await schemaLoader.load(props.schemaPath, options);
        console.log('[PageLoader] load() result:', { 
          schemaPath: props.schemaPath,
          success: result.success, 
          hasComponent: !!result.component,
          hasError: !!result.error,
          errorMessage: result.error?.message
        });
        loadResult.value = result;

        if (result.success && result.component) {
          pageComponent.value = result.component;
          console.log('[PageLoader] Component assigned, pageComponent:', !!result.component);
        } else {
          error.value = result.error || new Error('Unknown error loading schema');
          console.error('[PageLoader] Failed to load:', props.schemaPath, result.error);
        }

        if (props.layout) {
          const layoutResult = await schemaLoader.load(props.layout, options);
          if (layoutResult.success && layoutResult.component) {
            layoutComponent.value = layoutResult.component;
          } else {
            error.value = layoutResult.error || new Error('Unknown error loading layout');
          }
        }
      } catch (e) {
        error.value = e instanceof Error ? e : new Error(String(e));
        console.error('[PageLoader] Exception:', e);
      }

      isLoading.value = false;
      console.log('[PageLoader] loadSchema() complete, isLoading:', isLoading.value, 'hasError:', !!error.value);
    }

    function retry(): void {
      loadSchema();
    }

    watch(
      () => [props.schemaPath, props.layout],
      (newVals, oldVals) => {
        if (newVals[0] !== oldVals?.[0] || newVals[1] !== oldVals?.[1]) {
          loadSchema();
        }
      }
    );

    loadSchema();

    return () => {
      console.log('[PageLoader] render() called, isLoading:', isLoading.value, 'hasError:', !!error.value, 'hasPageComponent:', !!pageComponent.value, 'schemaPath:', props.schemaPath);
      if (isLoading.value) {
        console.log('[PageLoader] Showing loading state');
        if (slots.loading) {
          return slots.loading();
        }
        return h('div', { class: 'page-loader-loading' }, [
          h('div', { class: 'page-loader-spinner' }),
          h('span', 'Loading...'),
        ]);
      }

      if (error.value) {
        console.log('[PageLoader] Showing error state:', error.value.message);
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
        console.log('[PageLoader] Rendering with layout and page component');
        return h(layoutComponent.value, { pageContent: h(pageComponent.value!) });
      }

      if (pageComponent.value) {
        console.log('[PageLoader] Rendering page component only');
        if (slots.default) {
          return slots.default();
        }
        return h(pageComponent.value);
      }

      console.log('[PageLoader] Returning null (no content)');
      return null;
    };
  },
});

export function createPageLoader(): Component {
  return PageLoader;
}

export function createDefaultLoadingSpinner(): VNode {
  return h('div', { class: 'page-loader-loading' }, [
    h('div', { class: 'page-loader-spinner' }),
    h('span', 'Loading...'),
  ]);
}

export function createDefaultErrorUI(error: Error, retry: () => void): VNode {
  return h('div', { class: 'page-loader-error' }, [
    h('div', { class: 'page-loader-error-icon' }, '!'),
    h('h3', 'Load Failed'),
    h('p', error.message),
    h('button', { class: 'page-loader-retry-btn', onClick: retry }, 'Retry'),
  ]);
}