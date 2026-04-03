import type { WatchDefinition, WatchItemDefinition, ParserContext, ExpressionValue } from '../types';
import { isExpressionParseData } from '@json-engine/core-engine';
import { createValidationError } from '../utils/error';
import { validateFunctionValue } from '../utils/validate-function';

function validateExpressionValue(expr: unknown, path: string): ExpressionValue {
  if (!isExpressionParseData(expr)) {
    throw createValidationError(
      path,
      'Must be an ExpressionValue with _type="expression"',
      '{ _type: "expression", expression: "..." }',
      expr
    );
  }
  return expr;
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