import type {
  PropertyValue,
  RenderContext,
} from '../types';
import type { AbstractReferenceParseData, AbstractScopeParseData } from '@json-engine/core-engine';
import {
  isReferenceParseData,
  isExpressionParseData,
  isFunctionParseData,
  isScopeParseData,
} from '@json-engine/core-engine';
import type { FunctionValue } from '../types';
import { isRef, type Ref } from 'vue';

function createStateProxyForEvaluation(
  state: Record<string, Ref | Record<string, unknown>>
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
      target[prop] = value as Ref | Record<string, unknown>;
      return true;
    },
  });
}

type ExpressionResult = string | AbstractReferenceParseData | AbstractScopeParseData;

export {
  isReferenceParseData,
  isExpressionParseData,
  isFunctionParseData,
  isScopeParseData,
};

export function isStateReference(value: unknown): value is AbstractReferenceParseData & { prefix: 'state' } {
  return isReferenceParseData(value) && value.prefix === 'state';
}

export function isPropsReference(value: unknown): value is AbstractReferenceParseData & { prefix: 'props' } {
  return isReferenceParseData(value) && value.prefix === 'props';
}

export function isComputedReference(value: unknown): value is AbstractReferenceParseData & { prefix: 'computed' } {
  return isReferenceParseData(value) && value.prefix === 'computed';
}

export function isEChartsOption(value: unknown): value is { _type: 'echarts-option'; option: unknown } {
  if (typeof value !== 'object' || value === null) return false;
  return (value as Record<string, unknown>)._type === 'echarts-option';
}

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

function resolveExpressionsDeep(value: unknown, context: RenderContext): unknown {
  if (value === null || value === undefined) {
    return value;
  }

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

  if (isExpressionParseData(value)) {
    return evaluateExpression(value.expression as ExpressionResult, context);
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

export function resolvePropertyValue(value: PropertyValue, context: RenderContext): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (isExpressionParseData(value)) {
    return evaluateExpression(value.expression as ExpressionResult, context);
  }

  if (isReferenceParseData(value)) {
    const ref = value as AbstractReferenceParseData;
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
      const propsValue = context.props[ref.variable];
      if (ref.path) {
        return getNestedValue(propsValue, ref.path);
      }
      return propsValue;
    }
    if (ref.prefix === 'computed') {
      const computedRef = context.computed[ref.variable];
      let computedValue: unknown = computedRef;
      if (computedRef && typeof computedRef === 'object' && 'value' in computedRef) {
        computedValue = (computedRef as { value: unknown }).value;
      }
      if (ref.path) {
        if (ref.path === 'value') {
          return computedValue;
        }
        return getNestedValue(computedValue, ref.path);
      }
      return computedValue;
    }
  }

  if (isScopeParseData(value)) {
    const scopeKey = value.scope as 'core' | 'goal';
    const contextRecord = context as unknown as Record<string, unknown>;
    const scopeValue = contextRecord[scopeKey];
    if (scopeValue && typeof scopeValue === 'object') {
      return (scopeValue as Record<string, unknown>)[value.variable];
    }
    return undefined;
  }

  const valueRecord = value as unknown as Record<string, unknown>;
  if (valueRecord._type === 'echarts-option') {
    return resolveExpressionsDeep(valueRecord.option, context);
  }

  if (valueRecord._type === 'string' && typeof valueRecord.value === 'string') {
    return valueRecord.value;
  }

  if (valueRecord._type === 'object') {
    const objValue = value as { _type: 'object'; value: Record<string, unknown> };
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(objValue.value)) {
      result[key] = resolvePropertyValue(val as PropertyValue, context);
    }
    return result;
  }

  if (isFunctionParseData(value)) {
    const fnValue = value as FunctionValue;
    return (...args: unknown[]) => executeFunction(fnValue, context, args);
  }

  return value;
}

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
    if (ref.prefix === 'computed') {
      const computedRef = context.computed[ref.variable];
      let computedValue: unknown = computedRef;
      if (computedRef && typeof computedRef === 'object' && 'value' in computedRef) {
        computedValue = (computedRef as { value: unknown }).value;
      }
      if (ref.path) {
        if (ref.path === 'value') {
          return computedValue;
        }
        return getNestedValue(computedValue, ref.path);
      }
      return computedValue;
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

function evaluateStringExpression(expression: string, context: RenderContext): unknown {
  const trimmed = expression.trim();
  if (!trimmed) {
    return '';
  }

  const transformed = trimmed
    .replace(/\$state(?=\.|$|\s)/g, 'state')
    .replace(/\$props(?=\.|$|\s)/g, 'props')
    .replace(/\$computed(?=\.|$|\s)/g, 'computed')
    .replace(/\$_(core|ui)\.(\w+)(?=\.|$|\s)/g, 'coreScope._$2')
    .replace(/\$(core|ui)\.(\w+)(?=\.|$|\s)/g, 'coreScope._$2');

  const proxiedState = createStateProxyForEvaluation(context.state as Record<string, Ref | Record<string, unknown>>);
  const proxiedComputed = createStateProxyForEvaluation(context.computed as Record<string, Ref | Record<string, unknown>>);

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
      proxiedState,
      proxiedComputed,
      context.methods,
      context.emit,
      context.slots,
      context.attrs,
      context.provide,
      context.coreScope || {}
    );

    return result;
  } catch (error) {
    throw new Error(
      `Failed to evaluate expression "${expression}": ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function transformFunctionBody(body: string): string {
  if (!body) return body;
  
  let result = body;
  
  if (result.startsWith('{{') && result.endsWith('}}')) {
    result = result.slice(2, -2);
  }
  
  return result
    .replace(/\$event(?=\b|\s|$)/g, 'args[0]')
    .replace(/\$state(?=\.|$|\s)/g, 'state')
    .replace(/\$props(?=\.|$|\s)/g, 'props')
    .replace(/\$computed(?=\.|$|\s)/g, 'computed')
    .replace(/\$_(core|ui)\.(\w+)(?=\.|$|\s)/g, 'coreScope._$2')
    .replace(/\$(core|ui)\.(\w+)(?=\.|$|\s)/g, 'coreScope._$2');
}

function parseFunctionParams(params: Record<string, unknown> | string): string[] {
  if (!params) return [];
  
  if (typeof params === 'string') {
    let cleaned = params.trim();
    if (cleaned.startsWith('{{{') && cleaned.endsWith('}}}')) {
      cleaned = cleaned.slice(3, -3).trim();
    }
    if (cleaned.startsWith('{{') && cleaned.endsWith('}}')) {
      cleaned = cleaned.slice(2, -2).trim();
      try {
        const parsed = JSON.parse(cleaned);
        if (typeof parsed === 'object' && parsed !== null) {
          return Object.keys(parsed);
        }
      } catch {
        // Not JSON
      }
    }
    if (!cleaned) return [];
    return cleaned.split(',').map(p => p.trim()).filter(p => p);
  }
  
  if (typeof params === 'object') {
    return Object.keys(params);
  }
  
  return [];
}

export function executeFunction(
  fnValue: FunctionValue,
  context: RenderContext,
  args: unknown[] = []
): unknown {
  const transformedBody = transformFunctionBody(fnValue.body);
  
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
    });
    throw err;
  }
}