import { watch, watchEffect, type WatchSource, type WatchCallback, type WatchOptions } from 'vue';
import type { WatchDefinition, WatchItemDefinition, RenderContext, SetupContext, ExpressionValue, FunctionValue } from '../types';
import { ComponentCreationError } from '../utils/error';
import { evaluateExpression, executeFunction } from './value-resolver';

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

function createWatchSource(sourceExpr: ExpressionValue, context: RenderContext): WatchSource {
  return () => {
    try {
      return evaluateExpression(sourceExpr.expression, context);
    } catch {
      return undefined;
    }
  };
}

function createWatchHandler(handlerFn: FunctionValue, context: RenderContext): WatchCallback {
  return (newValue: unknown, oldValue: unknown) => {
    return executeFunction(handlerFn, context, [newValue, oldValue]);
  };
}

function createEffectFunction(effectFn: FunctionValue, context: RenderContext): () => void {
  return () => {
    return executeFunction(effectFn, context, []);
  };
}