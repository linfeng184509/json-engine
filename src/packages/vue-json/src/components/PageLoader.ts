import {
  defineComponent,
  ref,
  shallowRef,
  watch,
  type Component,
  type PropType,
  h,
  type VNode,
  type Slot,
  type SlotsType,
} from 'vue';
import type { SchemaLoadResult, SchemaLoadOptions } from '../runtime/schema-loader';
import { getSchemaLoader } from '../runtime/schema-loader';
import { getGlobalComponents } from '../composables/use-core-scope';

export interface PageLoaderProps {
  schemaPath: string;
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
    const isLoading = ref(true);
    const error = ref<Error | null>(null);
    const pageComponent = shallowRef<Component | null>(null);
    const loadResult = shallowRef<SchemaLoadResult | null>(null);

    const schemaLoader = getSchemaLoader();

    async function loadSchema(): Promise<void> {
      isLoading.value = true;
      error.value = null;
      pageComponent.value = null;

      const globalComponents = getGlobalComponents();
      const mergedComponents: Record<string, Component> = { ...globalComponents, ...props.extraComponents };

      const options: SchemaLoadOptions = {
        cache: props.cache,
        extraComponents: mergedComponents,
      };

      const result = await schemaLoader.load(props.schemaPath, options);
      loadResult.value = result;

      if (result.success && result.component) {
        pageComponent.value = result.component;
      } else {
        error.value = result.error || new Error('Unknown error loading schema');
      }

      isLoading.value = false;
    }

    function retry(): void {
      loadSchema();
    }

    watch(
      () => props.schemaPath,
      (newPath, oldPath) => {
        if (newPath !== oldPath) {
          loadSchema();
        }
      }
    );

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