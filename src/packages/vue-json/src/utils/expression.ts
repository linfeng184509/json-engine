import type { RenderContext } from '../types/runtime';
import { createExpressionError } from './error';

const expressionCache = new Map<string, Function>();

export function evaluateExpression(
  expression: string,
  context: RenderContext
): unknown {
  if (!expression || typeof expression !== 'string') {
    return expression;
  }

  const trimmed = expression.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const cachedFn = expressionCache.get(trimmed);
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
        `"use strict"; return (${trimmed});`
      );

    if (!cachedFn) {
      expressionCache.set(trimmed, fn);
    }

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
    throw createExpressionError(
      expression,
      `Failed to evaluate: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }
}

export function evaluateFunction(
  functionBody: string,
  context: RenderContext,
  args: unknown[] = []
): unknown {
  if (!functionBody || typeof functionBody !== 'string') {
    return undefined;
  }

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
      `"use strict"; ${functionBody}`
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
  } catch (error) {
    throw createExpressionError(
      functionBody,
      `Failed to execute function: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }
}

export function clearExpressionCache(): void {
  expressionCache.clear();
}

export function hasExpressionCache(expression: string): boolean {
  return expressionCache.has(expression.trim());
}