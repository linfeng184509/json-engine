import { watch, watchEffect, type WatchSource, type WatchCallback, type WatchOptions } from 'vue';
import type { WatchDefinition, WatchItemDefinition, RenderContext, SetupContext } from '../types';
import { ComponentCreationError } from '../utils/error';

export function setupWatchers(
  definition: WatchDefinition | undefined,
  context: SetupContext,
  state: Record<string, unknown>,
  computed: Record<string, unknown>,
  methods: Record<string, (...args: unknown[]) => unknown>
): void {
  if (!definition) return;

  const renderContext: RenderContext = {
    props: context.props,
    state: state as Record<string, ReturnType<typeof import('vue').ref> | ReturnType<typeof import('vue').reactive>>,
    computed: computed as Record<string, ReturnType<typeof import('vue').computed>>,
    methods,
    components: {},
    slots: context.slots,
    attrs: context.attrs,
    emit: context.emit,
    provide: {},
  };

  for (const [watchName, watchDef] of Object.entries(definition)) {
    try {
      const def = watchDef as WatchItemDefinition;

      if (def.type === 'effect') {
        const effectFn = createEffectFunction(def.handler, renderContext);
        watchEffect(effectFn);
        continue;
      }

      const source = createWatchSource(def.source, renderContext);
      const handler = createWatchHandler(def.handler, renderContext);
      const options: WatchOptions = {
        immediate: def.immediate,
        deep: def.deep,
        flush: def.flush,
      };

      watch(source, handler, options);
    } catch (error) {
      throw new ComponentCreationError(
        context.props?.['__componentName__'] as string || 'Unknown',
        `Failed to setup watch "${watchName}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

function createWatchSource(sourceExpr: string, context: RenderContext): WatchSource {
  return () => {
    try {
      const fn = new Function(
        'props',
        'state',
        'computed',
        'methods',
        'emit',
        'slots',
        'attrs',
        'provide',
        `"use strict"; return ${sourceExpr};`
      );
      return fn(
        context.props,
        context.state,
        context.computed,
        context.methods,
        context.emit,
        context.slots,
        context.attrs,
        context.provide
      );
    } catch {
      return undefined;
    }
  };
}

function createWatchHandler(handlerBody: string, context: RenderContext): WatchCallback {
  return (newValue: unknown, oldValue: unknown) => {
    const fn = new Function(
      'props',
      'state',
      'computed',
      'methods',
      'emit',
      'slots',
      'attrs',
      'provide',
      'newValue',
      'oldValue',
      `"use strict"; ${handlerBody}`
    );
    return fn(
      context.props,
      context.state,
      context.computed,
      context.methods,
      context.emit,
      context.slots,
      context.attrs,
      context.provide,
      newValue,
      oldValue
    );
  };
}

function createEffectFunction(effectBody: string, context: RenderContext): () => void {
  return () => {
    const fn = new Function(
      'props',
      'state',
      'computed',
      'methods',
      'emit',
      'slots',
      'attrs',
      'provide',
      `"use strict"; ${effectBody}`
    );
    return fn(
      context.props,
      context.state,
      context.computed,
      context.methods,
      context.emit,
      context.slots,
      context.attrs,
      context.provide
    );
  };
}