import type { RenderContext } from '@json-engine/vue-json';

export function resolveEChartsOption(
  value: unknown,
  context: RenderContext
): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }

  const v = value as Record<string, unknown>;
  if (v._type !== 'echarts-option') {
    return value;
  }

  const option = v.option;
  if (!option || typeof option !== 'object') {
    return option;
  }

  return resolveExpressionsDeep(option, context);
}

function resolveExpressionsDeep(obj: unknown, context: RenderContext): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    const match = obj.match(/^\{\{(.+)\}\}$/);
    if (match) {
      try {
        const expr = match[1].trim();
        return evaluateExpression(expr, context);
      } catch {
        return obj;
      }
    }
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => resolveExpressionsDeep(item, context));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[key] = resolveExpressionsDeep(value, context);
  }
  return result;
}

function evaluateExpression(expr: string, context: RenderContext): unknown {
  const stateTypes = (context as any).stateTypes || {};
  const transformed = expr
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
    .replace(/\bref_computed_([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g, (_, varName) => {
      return `computed.${varName}.value`;
    });

  const fn = new Function(
    'state',
    'props',
    'computed',
    'methods',
    '_',
    `"use strict"; return (${transformed})`
  );

  const state = (context as any).state || {};
  const props = (context as any).props || {};
  const computed = (context as any).computed || {};
  const methods = (context as any).methods || {};
  const _ = (context as any)._ || {};

  return fn(state, props, computed, methods, _);
}