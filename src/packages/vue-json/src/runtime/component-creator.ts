import {
  defineComponent,
  Fragment,
  h,
  isRef,
  ref,
  watch,
  type Component,
  type PropType,
  type ComponentOptions,
} from 'vue';
import type {
  VueJsonSchemaInput,
  SetupContext,
  FunctionValue,
  RenderContext,
} from '../types';
import { createParserCache } from '@json-engine/core-engine';
import { parseSchema } from '../parser';
import { createState } from './state-factory';
import { createComputed } from './computed-factory';
import { setupWatchers } from './watch-factory';
import { setupProvide, setupInject } from './provide-inject';
import { setupLifecycle } from './lifecycle-factory';
import { renderVNode } from './render-factory';
import { injectStyles, generateComponentId } from './style-injector';
import { ComponentCreationError } from '../utils/error';
import { executeFunction } from './value-resolver';
import { getGlobalComponents, getCoreScope } from '../composables/use-core-scope';
import { getPluginRegistry } from '../plugin/plugin-registry';
import type { PluginComponentDefinition } from '../types';
import type { CoreScope } from '../composables/use-core-scope';
import { PageLoader } from '../components/PageLoader';
import { Slot } from '../components/Slot';

export interface ComponentCreatorOptions {
  cache?: boolean;
  injectStyles?: boolean;
  debug?: boolean;
  extraComponents?: Record<string, Component>;
  registerPageLoader?: boolean;
  coreScope?: CoreScope;
}

const componentCache = createParserCache({
  enabled: true,
  maxSize: 500,
  ttl: 0,
});

const BUILTIN_COMPONENTS: Record<string, Component> = {
  PageLoader,
  Slot,
};

function getAllAvailableComponents(extraComponents: Record<string, Component>): Record<string, Component> {
  const globalComponents = getGlobalComponents();
  const registryComponents = getPluginRegistry().getAllComponents();

  const result: Record<string, Component> = {};

  for (const [name, def] of Object.entries(registryComponents)) {
    if (def && typeof def === 'object' && 'component' in def) {
      result[name] = (def as PluginComponentDefinition).component;
    }
  }

  return {
    ...globalComponents,
    ...result,
    ...extraComponents,
  };
}

export function createComponentCreator(
  schemaInput: VueJsonSchemaInput,
  options: ComponentCreatorOptions = {}
): Component {
  const {
    cache = true,
    injectStyles: shouldInjectStyles = true,
    debug = false,
    extraComponents = {},
    registerPageLoader = true,
    coreScope = getCoreScope(),
  } = options;

  const cacheKey = typeof schemaInput === 'string' ? schemaInput : (schemaInput.name || JSON.stringify(schemaInput));

  if (cache) {
    const cached = componentCache.get<Component>(cacheKey);
    if (cached) return cached;
  }

  const parseResult = parseSchema(schemaInput);

  if (!parseResult.success || !parseResult.data) {
    const errors = parseResult.errors?.map((e) => e.message).join('; ') || 'Unknown parse error';
    throw new ComponentCreationError('Unknown', `Schema parsing failed: ${errors}`);
  }

  const schema = parseResult.data;
  const componentId = generateComponentId(schema.name);

  if (shouldInjectStyles && schema.styles) {
    injectStyles(componentId, schema.styles.css, schema.styles.scoped);
  }

  const componentOptions: ComponentOptions = {
    name: schema.name,
    props: schema.props as Record<string, PropType<unknown>>,
    emits: schema.emits,
    components: schema.components,
    setup(props, { emit, slots, attrs }) {
      const context: SetupContext = {
        props: { ...props, __componentName__: schema.name },
        emit,
        slots,
        attrs,
      };

      const injected = schema.inject ? setupInject({ items: schema.inject.items }, context) : {};
      const state = createState(schema.state, context);

      // Create a version ref that triggers re-render when any state ref changes.
      const version = ref(0);

      // Set up watchers for each state ref to increment version on change
      for (const key of Object.keys(state)) {
        const val = state[key];
        if (isRef(val)) {
          watch(val, () => {
            console.log('[watch] State changed:', key, 'new version:', version.value + 1);
            version.value++;
          });
        }
      }

      const stateTypes: Record<string, 'ref' | 'reactive' | 'shallowRef' | 'shallowReactive' | 'readonly'> = {};
      if (schema.state) {
        for (const [key, def] of Object.entries(schema.state)) {
          if (def.type === 'toRef' || def.type === 'toRefs') {
            stateTypes[key] = 'ref';
          } else {
            stateTypes[key] = def.type as 'ref' | 'reactive' | 'shallowRef' | 'shallowReactive' | 'readonly';
          }
        }
      }

      const computedRefs = createComputed(schema.computed, context, state, stateTypes, coreScope as unknown as Record<string, unknown>);

      const provideRef = { value: injected as Record<string, unknown> };

      const methods = createMethods(
        schema.methods,
        context,
        state,
        computedRefs,
        provideRef,
        stateTypes,
        coreScope
      );

      setupWatchers(schema.watch, context, state, computedRefs, methods);
      setupLifecycle(schema.lifecycle, context, state, computedRefs, methods, coreScope as unknown as Record<string, unknown>);

      const provided = schema.provide
        ? setupProvide(schema.provide, context, state, computedRefs, methods)
        : {};

      provideRef.value = { ...injected, ...provided };

      if (debug) {
        console.log(`[vue-json-engine] ${schema.name} render context:`, {
          props,
          state,
          computed: computedRefs,
          methods,
          stateTypes,
        });
      }

      return () => {
        try {
          const allComponents: Record<string, Component> = {
            ...(registerPageLoader ? BUILTIN_COMPONENTS : {}),
            ...getAllAvailableComponents(extraComponents),
          };

          const vnode = renderVNode(schema.render, {
            props: context.props,
            state,
            computed: computedRefs,
            methods,
            components: allComponents,
            slots,
            attrs,
            emit,
            provide: provideRef.value,
            stateTypes,
            coreScope: coreScope as unknown as Record<string, unknown>,
          });

          // Wrap in Fragment with version key to force Vue to rebuild when state changes
          return h(Fragment, { key: version.value }, [vnode]);
        } catch (error) {
          console.error(`[vue-json-engine] Render error in ${schema.name}:`, error);
          throw error;
        }
      };
    },
  };

  const component = defineComponent(componentOptions);

  if (cache) {
    componentCache.set(cacheKey, component);
  }

  return component;
}

function createMethods(
  definition: Record<string, FunctionValue> | undefined,
  setupContext: SetupContext,
  state: Record<string, unknown>,
  computed: Record<string, unknown>,
  provideRef: { value: Record<string, unknown> },
  stateTypes: Record<string, 'ref' | 'reactive' | 'shallowRef' | 'shallowReactive' | 'readonly'>,
  coreScope: CoreScope
): Record<string, (...args: unknown[]) => unknown> {
  const methods: Record<string, (...args: unknown[]) => unknown> = {};

  if (!definition) return methods;

  for (const [methodName, fnValue] of Object.entries(definition)) {
    methods[methodName] = (...args: unknown[]) => {
      const renderContext: RenderContext = {
        props: setupContext.props,
        state: state as RenderContext['state'],
        computed: computed as RenderContext['computed'],
        methods,
        emit: setupContext.emit,
        slots: setupContext.slots,
        attrs: setupContext.attrs,
        provide: provideRef.value,
        components: {},
        stateTypes,
        coreScope: coreScope as unknown as Record<string, unknown>,
      };
      return executeFunction(fnValue, renderContext, args);
    };
  }

  return methods;
}

export function clearComponentCache(): void {
  componentCache.clear();
}

export function getCachedComponents(): Map<string, Component> {
  const result = new Map<string, Component>();
  for (const [key, value] of componentCache.entries()) {
    result.set(key, value as Component);
  }
  return result;
}
