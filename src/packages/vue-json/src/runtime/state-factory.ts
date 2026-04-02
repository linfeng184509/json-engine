import {
  ref,
  reactive,
  shallowRef,
  shallowReactive,
  toRef,
  toRefs,
  readonly,
  isRef,
  type Ref,
  type Reactive,
} from 'vue';
import type { StateDefinition, StateItemDefinition, SetupContext, ExpressionValue, PropsRef } from '../types';
import { evaluateExpression } from './value-resolver';
import { ComponentCreationError } from '../utils/error';

export function createState(
  definition: StateDefinition | undefined,
  context: SetupContext
): Record<string, Ref | Reactive<unknown>> {
  const state: Record<string, Ref | Reactive<unknown>> = {};

  if (!definition) return state;

  for (const [stateName, stateDef] of Object.entries(definition)) {
    try {
      const def = stateDef as StateItemDefinition;
      const initialValue = evaluateInitialValue(def.initial, context);

      switch (def.type) {
        case 'ref':
          state[stateName] = ref(initialValue);
          break;
        case 'reactive': {
          const obj = initialValue && typeof initialValue === 'object' ? initialValue : {};
          state[stateName] = reactive(obj as Record<string, unknown>);
          break;
        }
        case 'shallowRef':
          state[stateName] = shallowRef(initialValue);
          break;
        case 'shallowReactive': {
          const obj = initialValue && typeof initialValue === 'object' ? initialValue : {};
          state[stateName] = shallowReactive(obj as Record<string, unknown>);
          break;
        }
        case 'toRef':
          if (def.source && def.key) {
            const source = getSourceValue(def.source, context, state);
            if (source && typeof source === 'object') {
              state[stateName] = toRef(source as Record<string, unknown>, def.key);
            }
          }
          break;
        case 'toRefs':
          if (def.source) {
            const source = getSourceValue(def.source, context, state);
            if (source && typeof source === 'object') {
              Object.assign(state, toRefs(source as Record<string, unknown>));
            }
          }
          break;
        case 'readonly': {
          if (def.source) {
            const source = getSourceValue(def.source, context, state);
            if (source && typeof source === 'object') {
              state[stateName] = readonly(source as Record<string, unknown>);
            }
          }
          break;
        }
        default:
          state[stateName] = ref(initialValue);
      }
    } catch (error) {
      throw new ComponentCreationError(
        context.props?.['__componentName__'] as string || 'Unknown',
        `Failed to create state "${stateName}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return state;
}

/**
 * Creates a Proxy wrapper around the state object that automatically
 * unwraps `.value` from Vue ref objects when accessed via get,
 * and wraps values in `.value` when setting.
 * 
 * This allows $state.count to work without explicit .value references.
 */
export function createStateProxy(
  state: Record<string, Ref | Reactive<unknown>>
): Record<string, unknown> {
  return new Proxy(state, {
    get(target: Record<string, unknown>, prop: string): unknown {
      const value = target[prop];
      if (isRef(value)) {
        return value.value;
      }
      return value;
    },
    
    set(target: Record<string, unknown>, prop: string, value: unknown): boolean {
      const existing = target[prop];
      if (isRef(existing)) {
        (existing as Ref<unknown>).value = value;
        return true;
      }
      target[prop] = value as Ref | Reactive<unknown>;
      return true;
    },
  });
}

function evaluateInitialValue(initial: unknown, context: SetupContext): unknown {
  if (initial === null || initial === undefined) {
    return initial;
  }

  if (typeof initial !== 'object') {
    return initial;
  }

  const typed = initial as Record<string, unknown> & { _type?: string };

  if (typed._type === 'expression') {
    return evaluateExpression((initial as ExpressionValue).expression, {
      props: context.props,
      state: {},
      computed: {},
      methods: {},
      components: {},
      slots: context.slots,
      attrs: context.attrs,
      emit: context.emit,
      provide: {},
    });
  }

  if (typed._type === 'state') {
    return undefined;
  }

  if (typed._type === 'props') {
    const ref = initial as PropsRef;
    return context.props[ref.variable];
  }

  if (typed._type === 'function') {
    return initial;
  }

  return initial;
}

function getSourceValue(
  source: string,
  setupContext: SetupContext,
  currentState: Record<string, unknown>
): unknown {
  if (source === 'props') {
    return setupContext.props;
  }
  if (source.startsWith('state.')) {
    const stateKey = source.slice(6);
    return currentState[stateKey];
  }
  return undefined;
}
