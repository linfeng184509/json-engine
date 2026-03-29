import type { WatchDefinition, WatchItemDefinition, ParserContext, ExpressionValue, FunctionValue } from '../types';
import { createValidationError } from '../utils/error';

function isExpressionValue(value: unknown): value is ExpressionValue {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.body === 'string' || typeof obj.expression === 'string' || typeof obj.expression === 'object';
}

function isFunctionValue(value: unknown): value is FunctionValue {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.body === 'string' && obj.params !== undefined && obj.params !== null;
}

function validateExpressionValue(expr: unknown, path: string): ExpressionValue {
  if (!isExpressionValue(expr)) {
    throw createValidationError(
      path,
      'Must be an ExpressionValue with type and body',
      '{ type: "expression", body: "..." }',
      expr
    );
  }
  return expr;
}

function validateFunctionValue(fn: unknown, path: string): FunctionValue {
  if (!isFunctionValue(fn)) {
    throw createValidationError(
      path,
      'Must be a FunctionValue with type, params, and body',
      '{ type: "function", params: "", body: "..." }',
      fn
    );
  }

  if (fn.params === undefined || fn.params === null) {
    throw createValidationError(
      path,
      'FunctionValue must have a params field (can be empty string)',
      '{ type: "function", params: "", body: "..." }',
      fn
    );
  }

  return fn;
}

export function parseWatch(
  definition: WatchDefinition,
  context: ParserContext
): WatchDefinition {
  const result: WatchDefinition = {};

  for (const [watchName, watchDef] of Object.entries(definition)) {
    try {
      if (typeof watchDef !== 'object' || watchDef === null) {
        throw createValidationError(
          `watch.${watchName}`,
          'Watch definition must be an object',
          'object',
          watchDef
        );
      }

      const def = watchDef as WatchItemDefinition;

      if (!def.source) {
        throw createValidationError(
          `watch.${watchName}.source`,
          'Watch must have a "source" ExpressionValue'
        );
      }

      const source = validateExpressionValue(def.source, `watch.${watchName}.source`);

      if (!def.handler) {
        throw createValidationError(
          `watch.${watchName}.handler`,
          'Watch must have a "handler" FunctionValue'
        );
      }

      const handler = validateFunctionValue(def.handler, `watch.${watchName}.handler`);

      result[watchName] = {
        source,
        handler,
        immediate: def.immediate,
        deep: def.deep,
        flush: def.flush,
        type: def.type || 'watch',
      };
    } catch (error) {
      context.errors.push({
        path: `watch.${watchName}`,
        message: error instanceof Error ? error.message : String(error),
        value: watchDef,
      });
    }
  }

  return result;
}