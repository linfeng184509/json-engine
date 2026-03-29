import { parseNestedReference } from '@json-engine/core-engine';
import type { RenderContext } from '../types/runtime';
import { createExpressionError } from './error';

const functionCache = new Map<string, Function>();

/**
 * 解析引用表达式
 * 使用 core-engine 的 parseNestedReference 解析引用
 */
export function resolveReference(expression: string, context: RenderContext): unknown {
  const parsed = parseNestedReference(expression);

  if (typeof parsed === 'string') {
    return null;
  }

  switch (parsed.type) {
    case 'state': {
      const stateValue = context.state[parsed.variable];
      if (stateValue && typeof stateValue === 'object' && 'value' in stateValue) {
        return (stateValue as { value: unknown }).value;
      }
      return stateValue;
    }
    case 'props':
      return context.props[parsed.variable];
    case 'scope': {
      const scopeKey = parsed.scope as 'core' | 'goal';
      const contextRecord = context as unknown as Record<string, unknown>;
      const scopeValue = contextRecord[scopeKey];
      if (scopeValue && typeof scopeValue === 'object') {
        return (scopeValue as Record<string, unknown>)[parsed.variable];
      }
      return undefined;
    }
    default:
      return null;
  }
}

/**
 * 评估函数（接受 FunctionParseData 格式）
 */
export function evaluateFunction(
  functionBody: string,
  context: RenderContext,
  args: unknown[] = []
): unknown {
  if (!functionBody || typeof functionBody !== 'string') {
    return undefined;
  }

  try {
    const cachedFn = functionCache.get(functionBody);
    const fn =
      cachedFn ||
      new Function(
        'props',
        'state',
        'computed',
        'methods',
        'emit',
        'slots',
        'attrs',
        'provide',
        'args',
        `"use strict"; ${functionBody}`
      );

    if (!cachedFn) {
      functionCache.set(functionBody, fn);
    }

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
  } catch (error) {
    throw createExpressionError(
      functionBody,
      `Failed to execute function: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 清除函数缓存
 */
export function clearExpressionCache(): void {
  functionCache.clear();
}
