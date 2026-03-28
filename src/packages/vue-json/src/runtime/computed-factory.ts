import { computed, type ComputedRef, type WritableComputedRef } from 'vue';
import type { ComputedDefinition, RenderContext, SetupContext } from '../types';
import { ComponentCreationError } from '../utils/error';

export function createComputed(
  definition: ComputedDefinition | undefined,
  context: SetupContext,
  state: Record<string, unknown>
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
  };

  for (const [computedName, computedDef] of Object.entries(definition)) {
    try {
      const getter = new Function(
        'props',
        'state',
        'computed',
        'methods',
        'emit',
        'slots',
        'attrs',
        'provide',
        `"use strict"; ${computedDef.get}`
      );

      if (computedDef.set) {
        const setter = new Function(
          'props',
          'state',
          'computed',
          'methods',
          'emit',
          'slots',
          'attrs',
          'provide',
          'value',
          `"use strict"; ${computedDef.set}`
        );

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
              renderContext.provide
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
              value
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
            renderContext.provide
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