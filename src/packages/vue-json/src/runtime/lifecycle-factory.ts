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
import type { LifecycleDefinition, RenderContext, SetupContext } from '../types';
import { ComponentCreationError } from '../utils/error';

export function setupLifecycle(
  definition: LifecycleDefinition | undefined,
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
  hookBodies: string | string[] | undefined,
  hookFn: (fn: () => void | boolean) => void,
  context: RenderContext,
  hookName: string,
  hasErrorArg = false
): void {
  if (!hookBodies) return;

  const bodies = Array.isArray(hookBodies) ? hookBodies : [hookBodies];

  for (const body of bodies) {
    try {
      const handler = createHookHandler(body, context, hasErrorArg);
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
  body: string,
  context: RenderContext,
  hasErrorArg: boolean
): (error?: Error) => void | boolean {
  return (error?: Error) => {
    const baseArgs = [
      context.props,
      context.state,
      context.computed,
      context.methods,
      context.emit,
      context.slots,
      context.attrs,
      context.provide,
    ];

    let fn: Function;
    let result: unknown;

    if (hasErrorArg) {
      fn = new Function(
        'props',
        'state',
        'computed',
        'methods',
        'emit',
        'slots',
        'attrs',
        'provide',
        'error',
        `"use strict"; ${body}`
      );
      result = fn(...baseArgs, error);
    } else {
      fn = new Function(
        'props',
        'state',
        'computed',
        'methods',
        'emit',
        'slots',
        'attrs',
        'provide',
        `"use strict"; ${body}`
      );
      result = fn(...baseArgs);
    }

    return result as void | boolean;
  };
}