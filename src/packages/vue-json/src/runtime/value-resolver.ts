import type {
  PropertyValue,
  ExpressionValue,
  FunctionValue,
  StateRef,
  PropsRef,
  ScopeRef,
  RenderContext,
} from '../types';
import type { NestedReferenceResult, NestedReferenceData } from '@json-engine/core-engine';

/**
 * 判断是否为 ExpressionValue（带 _type 标记）
 */
export function isExpressionValue(value: unknown): value is ExpressionValue {
  if (typeof value !== 'object' || value === null) return false;
  return (value as Record<string, unknown>)['_type'] === 'expression';
}

/**
 * 判断是否为 FunctionValue（带 _type 标记）
 */
export function isFunctionValue(value: unknown): value is FunctionValue {
  if (typeof value !== 'object' || value === null) return false;
  return (value as Record<string, unknown>)['_type'] === 'function';
}

/**
 * 判断是否为 StateRef（带 _type 标记）
 */
export function isStateRef(value: unknown): value is StateRef {
  if (typeof value !== 'object' || value === null) return false;
  return (value as Record<string, unknown>)['_type'] === 'state';
}

/**
 * 判断是否为 PropsRef（带 _type 标记）
 */
export function isPropsRef(value: unknown): value is PropsRef {
  if (typeof value !== 'object' || value === null) return false;
  return (value as Record<string, unknown>)['_type'] === 'props';
}

/**
 * 判断是否为 ScopeRef（带 _type 标记）
 */
export function isScopeRef(value: unknown): value is ScopeRef {
  if (typeof value !== 'object' || value === null) return false;
  return (value as Record<string, unknown>)['_type'] === 'scope';
}

/**
 * 解析 PropertyValue，返回实际值
 */
export function resolvePropertyValue(value: PropertyValue, context: RenderContext): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  // 使用类型断言来获取 _type 字段
  const type = (value as unknown as { _type?: string })._type;

  switch (type) {
    case 'expression': {
      const expr = value as ExpressionValue;
      return evaluateExpression(expr.expression, context);
    }
    case 'state': {
      const ref = value as StateRef;
      const stateValue = context.state[ref.variable];
      return stateValue && typeof stateValue === 'object' && 'value' in stateValue
        ? stateValue.value
        : stateValue;
    }
    case 'props': {
      const ref = value as PropsRef;
      return context.props[ref.variable];
    }
    case 'scope': {
      const ref = value as ScopeRef;
      const scopeKey = ref.scope as 'core' | 'goal';
      const contextRecord = context as unknown as Record<string, unknown>;
      const scopeValue = contextRecord[scopeKey];
      if (scopeValue && typeof scopeValue === 'object') {
        return (scopeValue as Record<string, unknown>)[ref.variable];
      }
      return undefined;
    }
    default:
      return value;
  }
}

/**
 * 评估表达式
 * @param expression - NestedReferenceResult 或字符串表达式
 * @param context - 渲染上下文
 */
export function evaluateExpression(
  expression: NestedReferenceResult,
  context: RenderContext
): unknown {
  if (typeof expression === 'string') {
    // 纯表达式字符串
    return evaluateStringExpression(expression, context);
  }

  // NestedReferenceData - 直接引用
  const ref = expression as NestedReferenceData;
  switch (ref.type) {
    case 'state': {
      const stateValue = context.state[ref.variable];
      return stateValue && typeof stateValue === 'object' && 'value' in stateValue
        ? (stateValue as { value: unknown }).value
        : stateValue;
    }
    case 'props':
      return context.props[ref.variable];
    case 'scope': {
      const scopeKey = ref.scope as 'core' | 'goal';
      const contextRecord = context as unknown as Record<string, unknown>;
      const scopeValue = contextRecord[scopeKey];
      if (scopeValue && typeof scopeValue === 'object') {
        return (scopeValue as Record<string, unknown>)[ref.variable];
      }
      return undefined;
    }
  }
}

/**
 * 评估字符串表达式（处理引用格式）
 */
function evaluateStringExpression(expression: string, context: RenderContext): unknown {
  const trimmed = expression.trim();
  if (!trimmed) {
    return '';
  }

  // 替换引用格式为可执行代码
  const transformed = trimmed
    .replace(/ref_state_([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (_, varName) => {
      return `state.${varName}.value`;
    })
    .replace(/ref_props_([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (_, varName) => {
      return `props.${varName}`;
    })
    .replace(/ref_computed_([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (_, varName) => {
      return `computed.${varName}.value`;
    });

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
      `"use strict"; return (${transformed});`
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
  } catch (error) {
    throw new Error(
      `Failed to evaluate expression "${expression}": ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 执行函数值
 */
export function executeFunction(
  fnValue: FunctionValue,
  context: RenderContext,
  args: unknown[] = []
): unknown {
  const fn = new Function(
    'props',
    'state',
    'computed',
    'methods',
    'emit',
    'slots',
    'attrs',
    'provide',
    'args',
    `"use strict"; ${fnValue.body}`
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
    args
  );
}
