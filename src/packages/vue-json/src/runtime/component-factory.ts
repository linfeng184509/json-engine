import {
  defineComponent,
  h,
  type Component,
  type PropType,
  type ComponentOptions,
} from 'vue';
import type { VueJsonSchemaInput, CreateComponentOptions, SetupContext, FunctionValue, RenderContext } from '../types';
import { parseSchema } from '../parser';
import { createState } from './state-factory';
import { createComputed } from './computed-factory';
import { setupWatchers } from './watch-factory';
import { setupProvide, setupInject } from './provide-inject';
import { setupLifecycle } from './lifecycle-factory';
import { renderVNode } from './render-factory';
import { injectStyles, generateComponentId, removeStyles } from './style-injector';
import { ComponentCreationError } from '../utils/error';
import { executeFunction } from './value-resolver';

const componentCache = new Map<string, Component>();

export function createComponent(
  schemaInput: VueJsonSchemaInput,
  options: CreateComponentOptions = {}
): Component {
  const { cache = true, injectStyles: shouldInjectStyles = true, debug = false } = options;

  const cacheKey = typeof schemaInput === 'string' ? schemaInput : JSON.stringify(schemaInput);

  if (cache && componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)!;
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
      const computedRefs = createComputed(schema.computed, context, state);

      const provideRef = { value: injected as Record<string, unknown> };
      const methods = createMethods(
        schema.methods,
        context,
        state,
        computedRefs,
        provideRef
      );

      setupWatchers(schema.watch, context, state, computedRefs, methods);
      setupLifecycle(schema.lifecycle, context, state, computedRefs, methods);

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
        });
      }

      // 返回渲染函数和状态
      return () => {
        try {
          return renderVNode(schema.render, {
            props: context.props,
            state,
            computed: computedRefs,
            methods,
            components: schema.components || {},
            slots,
            attrs,
            emit,
            provide: provideRef.value,
          });
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
  provideRef: { value: Record<string, unknown> }
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
  return new Map(componentCache);
}

export { removeStyles };