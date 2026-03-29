import {
  ref,
  reactive,
  shallowRef,
  shallowReactive,
  toRef,
  toRefs,
  readonly,
  type Ref,
  type Reactive,
} from 'vue';
import type { StateDefinition, StateItemDefinition, SetupContext, ExpressionValue, StateRef, PropsRef } from '../types';
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
 * 评估初始值
 * 使用 _type 字段判断结构化类型
 */
function evaluateInitialValue(initial: unknown, context: SetupContext): unknown {
  if (initial === null || initial === undefined) {
    return initial;
  }

  if (typeof initial !== 'object') {
    return initial;
  }

  const typed = initial as Record<string, unknown> & { _type?: string };

  // 处理 ExpressionValue（带 _type 标记）
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

  // 处理 StateRef（带 _type 标记）
  if (typed._type === 'state') {
    // State 初始值不能引用自身（state 为空）
    return undefined;
  }

  // 处理 PropsRef（带 _type 标记）
  if (typed._type === 'props') {
    const ref = initial as PropsRef;
    return context.props[ref.variable];
  }

  // 处理 FunctionValue（带 _type 标记）- 不支持作为初始值
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
