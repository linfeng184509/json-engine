import { createParserConfig, parseNestedReference } from '@json-engine/core-engine';
import type { RenderContext } from '../types/runtime';
import { createExpressionError } from './error';

const vueParserConfig = createParserConfig({
  referencePrefixes: ['props', 'state', 'computed'],
  scopeNames: ['core', 'goal'],
});

const functionCache = new Map<string, Function>();

export function resolveReference(expression: string, context: RenderContext): unknown {
  const { referenceRegex, scopeRegex, innerReferenceRegex, innerScopeRegex } = vueParserConfig;

  const parsed = parseNestedReference(
    expression,
    referenceRegex,
    scopeRegex,
    innerReferenceRegex,
    innerScopeRegex
  );

  if (typeof parsed === 'string') {
    return null;
  }

  switch (parsed._type) {
    case 'reference': {
      if (parsed.prefix === 'state') {
        const stateValue = context.state[parsed.variable];
        if (stateValue && typeof stateValue === 'object' && 'value' in stateValue) {
          return (stateValue as { value: unknown }).value;
        }
        return stateValue;
      }
      if (parsed.prefix === 'props') {
        return context.props[parsed.variable];
      }
      return undefined;
    }
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

export function clearExpressionCache(): void {
  functionCache.clear();
}