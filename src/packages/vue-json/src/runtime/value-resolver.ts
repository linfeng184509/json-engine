import type {
  PropertyValue,
  ExpressionValue,
  FunctionValue,
  StateRef,
  PropsRef,
  ScopeRef,
  RenderContext,
} from '../types';
import type { AbstractReferenceParseData, AbstractScopeParseData } from '@json-engine/core-engine';

type ExpressionResult = string | AbstractReferenceParseData | AbstractScopeParseData;

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
 * 判断是否为 EChartsOption（带 _type 标记）
 */
export function isEChartsOption(value: unknown): value is { _type: 'echarts-option'; option: unknown } {
  if (typeof value !== 'object' || value === null) return false;
  return (value as Record<string, unknown>)['_type'] === 'echarts-option';
}

/**
 * 递归解析对象中的所有表达式
 */
function resolveExpressionsDeep(value: unknown, context: RenderContext): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  // Handle string expressions like {{ref_state_xxx}}
  if (typeof value === 'string') {
    const match = value.match(/^\{\{(.+)\}\}$/);
    if (match) {
      return evaluateStringExpression(match[1].trim(), context);
    }
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (isExpressionValue(value)) {
    return evaluateExpression(value.expression, context);
  }

  if (Array.isArray(value)) {
    return value.map(item => resolveExpressionsDeep(item, context));
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    result[key] = resolveExpressionsDeep(val, context);
  }
  return result;
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
    case 'echarts-option': {
      const echartsOption = value as unknown as { _type: 'echarts-option'; option: unknown };
      return resolveExpressionsDeep(echartsOption.option, context);
    }
    default:
      return value;
  }
}

/**
 * 评估表达式
 */
export function evaluateExpression(
  expression: ExpressionResult,
  context: RenderContext
): unknown {
  if (typeof expression === 'string') {
    return evaluateStringExpression(expression, context);
  }

  if (expression._type === 'reference') {
    const ref = expression as AbstractReferenceParseData;
    if (ref.prefix === 'state') {
      let stateRef = context.state[ref.variable];
      if (stateRef === undefined && context.computed) {
        stateRef = context.computed[ref.variable];
      }
      let stateValue: unknown = stateRef;
      if (stateRef && typeof stateRef === 'object' && 'value' in stateRef) {
        stateValue = (stateRef as { value: unknown }).value;
      }
      if (ref.path) {
        return getNestedValue(stateValue, ref.path);
      }
      return stateValue;
    }
    if (ref.prefix === 'props') {
      if (ref.path) {
        return getNestedValue(context.props[ref.variable], ref.path);
      }
      return context.props[ref.variable];
    }
    return undefined;
  }

  if (expression._type === 'scope') {
    const ref = expression as AbstractScopeParseData;
    const scopeKey = ref.scope as 'core' | 'goal';
    const contextRecord = context as unknown as Record<string, unknown>;
    const scopeValue = contextRecord[scopeKey];
    if (scopeValue && typeof scopeValue === 'object') {
      return (scopeValue as Record<string, unknown>)[ref.variable];
    }
    return undefined;
  }

  return undefined;
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
    .replace(/\$\_\[core\]_([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (_, prop) => {
      return `coreScope._${prop}`;
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
      'coreScope',
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
      context.provide,
      context.coreScope || {}
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
  let result = body;
  
  // Remove {{ }} wrapper if present
  if (result.startsWith('{{') && result.endsWith('}}')) {
    result = result.slice(2, -2);
  }
  
  return result
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
    .replace(/\$\_\[core\]_([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (_, prop) => {
      return `coreScope._${prop}`;
    })
    .replace(/\btodo\.(\w+)\b/g, (_, prop) => {
      return `state.todo.${prop}`;
    });
}

/**
 * 解析函数参数
 */
function parseFunctionParams(params: Record<string, unknown> | string): string[] {
  if (!params) return [];
  
  // If params is a string, parse it directly
  if (typeof params === 'string') {
    let cleaned = params.trim();
    if (cleaned.startsWith('{{{') && cleaned.endsWith('}}}')) {
      cleaned = cleaned.slice(3, -3).trim();
    }
    if (!cleaned) return [];
    return cleaned.split(',').map(p => p.trim()).filter(p => p);
  }
  
  // If params is an object, extract keys
  if (typeof params === 'object') {
    const keys = Object.keys(params);
    return keys;
  }
  
  return [];
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
  
  // Parse params and create bindings
  const paramNames = parseFunctionParams(fnValue.params);
  const paramBindings = paramNames.length > 0 
    ? paramNames.map((name, index) => `var ${name} = args[${index}];`).join(' ')
    : '';

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
      'args',
      'coreScope',
      `"use strict"; ${paramBindings} ${transformedBody}`
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
      args,
      context.coreScope || {}
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[vue-json-engine] Function execution error:', {
      body: fnValue.body.substring(0, 100),
      transformedBody: transformedBody.substring(0, 200),
      params: fnValue.params,
      paramNames,
      argsLength: args.length,
      errorMessage: err.message,
      errorStack: err.stack
    });
    throw err;
  }
}