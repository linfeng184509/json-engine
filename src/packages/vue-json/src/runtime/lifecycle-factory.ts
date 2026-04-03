import {
  onMounted,
  onUnmounted,
  onUpdated,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onErrorCaptured,
  onActivated,
  onDeactivated,
} from 'vue';
import type { LifecycleDefinition, RenderContext, SetupContext, FunctionValue } from '../types';
import { ComponentCreationError } from '../utils/error';
import { executeFunction } from './value-resolver';
import { getLogger } from '../utils/logger';

const logger = getLogger('lifecycle-factory');

export function setupLifecycle(
  definition: LifecycleDefinition | undefined,
  context: SetupContext,
  state: Record<string, unknown>,
  computed: Record<string, unknown>,
  methods: Record<string, (...args: unknown[]) => unknown>,
  coreScope?: Record<string, unknown>
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
    coreScope,
  };

  logger.debug('Setting up lifecycle hooks');
  setupHook(definition.onMounted, onMounted, renderContext, 'onMounted');
  setupHook(definition.onUnmounted, onUnmounted, renderContext, 'onUnmounted');
  setupHook(definition.onUpdated, onUpdated, renderContext, 'onUpdated');
  setupHook(definition.onBeforeMount, onBeforeMount, renderContext, 'onBeforeMount');
  setupHook(definition.onBeforeUnmount, onBeforeUnmount, renderContext, 'onBeforeUnmount');
  setupHook(definition.onBeforeUpdate, onBeforeUpdate, renderContext, 'onBeforeUpdate');
  setupHook(definition.onErrorCaptured, onErrorCaptured, renderContext, 'onErrorCaptured', true);
  setupHook(definition.onActivated, onActivated, renderContext, 'onActivated');
  setupHook(definition.onDeactivated, onDeactivated, renderContext, 'onDeactivated');
}

function setupHook(
  hookFns: FunctionValue | FunctionValue[] | undefined,
  hookFn: (fn: () => void | boolean) => void,
  context: RenderContext,
  hookName: string,
  hasErrorArg = false
): void {
  if (!hookFns) return;

  const fns = Array.isArray(hookFns) ? hookFns : [hookFns];

  for (const fnValue of fns) {
    try {
      const handler = createHookHandler(fnValue, context, hasErrorArg);
      hookFn(handler);
    } catch (error) {
      throw new ComponentCreationError(
        context.props?.['__componentName__'] as string || 'Unknown',
        `Failed to setup ${hookName}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

function createHookHandler(
  fnValue: FunctionValue,
  context: RenderContext,
  hasErrorArg: boolean
): (error?: Error) => void | boolean {
  return (error?: Error) => {
    logger.debug('Hook fired: %s', context.props?.['__componentName__']);
    if (hasErrorArg) {
      return executeFunction(fnValue, context, [error]) as void | boolean;
    }
    return executeFunction(fnValue, context, []) as void | boolean;
  };
}