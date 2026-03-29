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
 * 获取嵌套属性值
 * 支持点号路径访问，如 'formData.name' → obj.formData.name
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || !path) return obj;

  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === 'object') {
      result = (result as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return result;
}

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

  const type = (value as unknown as { _type?: string })._type;

  switch (type) {
    case 'expression': {
      const expr = value as ExpressionValue;
      return evaluateExpression(expr.expression, context);
    }
    case 'state': {
      const ref = value as StateRef;
      const stateRef = context.state[ref.variable];
      let stateValue: unknown = stateRef;
      if (stateRef && typeof stateRef === 'object' && 'value' in stateRef) {
        stateValue = (stateRef as { value: unknown }).value;
      }
      if (ref.path) {
        return getNestedValue(stateValue, ref.path);
      }
      return stateValue;
    }
    case 'props': {
      const ref = value as PropsRef;
      const propsValue = context.props[ref.variable];
      if (ref.path) {
        return getNestedValue(propsValue, ref.path);
      }
      return propsValue;
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
 */
export function evaluateExpression(
  expression: NestedReferenceResult,
  context: RenderContext
): unknown {
  if (typeof expression === 'string') {
    return evaluateStringExpression(expression, context);
  }

  const ref = expression as NestedReferenceData;
  switch (ref.type) {
    case 'state': {
      let stateRef = context.state[ref.variable];
      if (stateRef === undefined && context.computed) {
        stateRef = context.computed[ref.variable];
      }
      let stateValue: unknown = stateRef;
      if (stateRef && typeof stateRef === 'object' && 'value' in stateRef) {
        stateValue = (stateRef as { value: unknown }).value;
      }
      if (ref.scope && typeof ref.scope === 'string' && !['core', 'goal'].includes(ref.scope)) {
        return getNestedValue(stateValue, ref.scope);
      }
      return stateValue;
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

  const stateTypes = context.stateTypes || {};

  const transformed = trimmed
    .replace(/\bref_state_([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\b/g, (_, path) => {
      const parts = path.split('.');
      const varName = parts[0];
      const rest = parts.slice(1);
      const stateType = stateTypes[varName];
      const needsValue = stateType === 'ref' || stateType === 'shallowRef' || stateType === undefined;

      if (rest.length === 0) {
        return needsValue ? `state.${varName}.value` : `state.${varName}`;
      }
      const middle = needsValue ? '.value.' : '.';
      return `state.${varName}${middle}${rest.join('.')}`;
    })
    .replace(/\bref_props_([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\b/g, (_, path) => {
      return `props.${path}`;
    })
    .replace(/\bref_computed_([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\b/g, (_, varName) => {
      return `computed.${varName}.value`;
    })
    .replace(/\btodo\.(\w+)\b/g, (_, prop) => {
      return `state.todo.${prop}`;
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

    const result = fn(
      context.props,
      context.state,
      context.computed,
      context.methods,
      context.emit,
      context.slots,
      context.attrs,
      context.provide
    );

    if (result && typeof result === 'object' && 'value' in result) {
      return (result as { value: unknown }).value;
    }
    return result;
  } catch (error) {
    throw new Error(
      `Failed to evaluate expression "${expression}": ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 转换函数体中的引用格式
 */
export function transformFunctionBody(body: string, stateTypes: Record<string, string>): string {
  return body
    .replace(/\bref_state_([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\b/g, (_, path) => {
      const parts = path.split('.');
      const varName = parts[0];
      const rest = parts.slice(1);
      const stateType = stateTypes[varName];
      const needsValue = stateType === 'ref' || stateType === 'shallowRef' || stateType === undefined;

      if (rest.length === 0) {
        return needsValue ? `state.${varName}.value` : `state.${varName}`;
      }
      const middle = needsValue ? '.value.' : '.';
      return `state.${varName}${middle}${rest.join('.')}`;
    })
    .replace(/\bref_props_([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\b/g, (_, path) => {
      return `props.${path}`;
    })
    .replace(/\btodo\.(\w+)\b/g, (_, prop) => {
      return `state.todo.${prop}`;
    });
}

/**
 * 执行函数值
 */
export function executeFunction(
  fnValue: FunctionValue,
  context: RenderContext,
  args: unknown[] = []
): unknown {
  const stateTypes = context.stateTypes || {};
  const transformedBody = transformFunctionBody(fnValue.body, stateTypes);

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
    `"use strict"; ${transformedBody}`
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