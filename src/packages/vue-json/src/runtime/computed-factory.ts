import { computed, type ComputedRef, type WritableComputedRef } from 'vue';
import type { ComputedDefinition, RenderContext, SetupContext, FunctionValue } from '../types';
import { ComponentCreationError } from '../utils/error';
import { transformFunctionBody } from './value-resolver';

export function createComputed(
  definition: ComputedDefinition | undefined,
  context: SetupContext,
  state: Record<string, unknown>,
  stateTypes: Record<string, 'ref' | 'reactive' | 'shallowRef' | 'shallowReactive' | 'readonly'> = {},
  coreScope?: Record<string, unknown>
): Record<string, ComputedRef<unknown> | WritableComputedRef<unknown>> {
  const computeds: Record<string, ComputedRef<unknown> | WritableComputedRef<unknown>> = {};

  if (!definition) return computeds;

  const renderContext: RenderContext = {
    props: context.props,
    state: state as Record<string, ReturnType<typeof import('vue').ref> | ReturnType<typeof import('vue').reactive>>,
    computed: computeds,
    methods: {},
    components: {},
    slots: context.slots,
    attrs: context.attrs,
    emit: context.emit,
    provide: {},
    stateTypes,
    coreScope,
  };

  for (const [computedName, computedDef] of Object.entries(definition)) {
    try {
      const getterFn = computedDef.get;
      const getter = createFunctionFromValue(getterFn, stateTypes);

      if (computedDef.set) {
        const setterFn = computedDef.set;
        const setter = createFunctionFromValue(setterFn, stateTypes);

        computeds[computedName] = computed({
          get: () =>
            getter(
              renderContext.props,
              renderContext.state,
              renderContext.computed,
              renderContext.methods,
              renderContext.emit,
              renderContext.slots,
              renderContext.attrs,
              renderContext.provide,
              undefined,
              coreScope || {}
            ),
          set: (value: unknown) =>
            setter(
              renderContext.props,
              renderContext.state,
              renderContext.computed,
              renderContext.methods,
              renderContext.emit,
              renderContext.slots,
              renderContext.attrs,
              renderContext.provide,
              value,
              coreScope || {}
            ),
        });
      } else {
        computeds[computedName] = computed(() =>
          getter(
            renderContext.props,
            renderContext.state,
            renderContext.computed,
            renderContext.methods,
            renderContext.emit,
            renderContext.slots,
            renderContext.attrs,
            renderContext.provide,
            undefined,
            coreScope || {}
          )
        );
      }

      renderContext.computed = computeds;
    } catch (error) {
      throw new ComponentCreationError(
        context.props?.['__componentName__'] as string || 'Unknown',
        `Failed to create computed "${computedName}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return computeds;
}

function createFunctionFromValue(
  fnValue: FunctionValue,
  stateTypes: Record<string, 'ref' | 'reactive' | 'shallowRef' | 'shallowReactive' | 'readonly'>
): (...args: unknown[]) => unknown {
  const transformedBody = transformFunctionBody(fnValue.body, stateTypes);
  const rawFn = new Function(
    'props',
    'state',
    'computed',
    'methods',
    'emit',
    'slots',
    'attrs',
    'provide',
    'value',
    'coreScope',
    `"use strict"; ${transformedBody}`
  );

  return rawFn as (...args: unknown[]) => unknown;
}