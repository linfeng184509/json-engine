import { parseNestedReference } from '@json-engine/core-engine';
import type { RenderContext } from '../types/runtime';
import { createExpressionError } from './error';

const expressionCache = new Map<string, Function>();

const REF_STATE_REGEX = /^ref_state_([a-zA-Z_$][a-zA-Z0-9_$]*)$/;
const REF_PROPS_REGEX = /^ref_props_([a-zA-Z_$][a-zA-Z0-9_$]*)$/;
const REF_COMPUTED_REGEX = /^ref_computed_([a-zA-Z_$][a-zA-Z0-9_$]*)$/;
const SCOPE_REGEX = /^\$_\[(core|goal)\]_([a-zA-Z_$][a-zA-Z0-9_$]*)$/;

export function resolveReference(expression: string, context: RenderContext): unknown {
  const parsed = parseNestedReference(expression);

  if (typeof parsed === 'string') {
    return null;
  }

  switch (parsed.type) {
    case 'state': {
      const stateValue = context.state[parsed.variable];
      if (stateValue && typeof stateValue === 'object' && 'value' in stateValue) {
        return stateValue.value;
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

function isCoreEngineReference(expression: string): boolean {
  return (
    REF_STATE_REGEX.test(expression) ||
    REF_PROPS_REGEX.test(expression) ||
    REF_COMPUTED_REGEX.test(expression) ||
    SCOPE_REGEX.test(expression)
  );
}

function replaceReferencesInExpression(expression: string): string {
  return expression
    .replace(/ref_state_([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (_, varName) => {
      return `state.${varName}.value`;
    })
    .replace(/ref_props_([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (_, varName) => {
      return `props.${varName}`;
    })
    .replace(/ref_computed_([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (_, varName) => {
      return `computed.${varName}.value`;
    })
    .replace(/\$_\[(core|goal)\]_([a-zA-Z_$][a-zA-Z0-9_$]*)/g, (_, scope, varName) => {
      return `${scope}.${varName}`;
    });
}

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
    if (isCoreEngineReference(trimmed)) {
      const refValue = resolveReference(trimmed, context);
      if (refValue !== null) {
        return refValue;
      }
    }

    const transformedExpression = replaceReferencesInExpression(trimmed);

    const cachedFn = expressionCache.get(transformedExpression);
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
        `"use strict"; return (${transformedExpression});`
      );

    if (!cachedFn) {
      expressionCache.set(transformedExpression, fn);
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