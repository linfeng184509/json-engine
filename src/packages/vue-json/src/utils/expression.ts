import { createParserConfig } from '@json-engine/core-engine';
import type { RenderContext } from '../types/runtime';
import { createExpressionError } from './error';

const vueParserConfig = createParserConfig({
  referencePrefixes: ['props', 'state', 'computed'],
  scopeNames: ['core', 'goal'],
});

const functionCache = new Map<string, Function>();

/**
 * 解析引用表达式
 * 使用 core-engine 的 parseNestedReference 解析引用
 */
export function resolveReference(expression: string, context: RenderContext): unknown {
  const parsed = parseNestedReferenceWithConfig(expression);

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

function parseNestedReferenceWithConfig(content: string): string | { _type: 'reference'; prefix: string; variable: string; path?: string } | { _type: 'scope'; scope: string; variable: string } {
  if (!content) return content;

  const { referenceRegex, scopeRegex, innerReferenceRegex, innerScopeRegex } = vueParserConfig;

  const scopeMatch = content.match(scopeRegex);
  if (scopeMatch) {
    return { _type: 'scope', scope: scopeMatch[1], variable: scopeMatch[2] };
  }

  const refMatch = content.match(referenceRegex);
  if (refMatch) {
    const fullPath = refMatch[2];
    const dotIndex = fullPath.indexOf('.');
    if (dotIndex > 0) {
      return {
        _type: 'reference',
        prefix: refMatch[1],
        variable: fullPath.substring(0, dotIndex),
        path: fullPath.substring(dotIndex + 1),
      };
    }
    return { _type: 'reference', prefix: refMatch[1], variable: fullPath };
  }

  const innerScopeMatch = content.match(innerScopeRegex);
  if (innerScopeMatch) {
    return { _type: 'scope', scope: innerScopeMatch[1], variable: innerScopeMatch[2] };
  }

  const innerRefMatch = content.match(innerReferenceRegex);
  if (innerRefMatch) {
    return { _type: 'reference', prefix: innerRefMatch[1], variable: innerRefMatch[2] };
  }

  return content;
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
