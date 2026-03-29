import type { ComputedDefinition, ComputedItemDefinition, ParserContext, FunctionValue } from '../types';
import { createValidationError } from '../utils/error';

function isFunctionValue(value: unknown): value is FunctionValue {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.body === 'string' && obj.params !== undefined && obj.params !== null;
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

export function parseComputed(
  definition: ComputedDefinition,
  context: ParserContext
): ComputedDefinition {
  const result: ComputedDefinition = {};

  for (const [computedName, computedDef] of Object.entries(definition)) {
    try {
      if (typeof computedDef !== 'object' || computedDef === null) {
        throw createValidationError(
          `computed.${computedName}`,
          'Computed definition must be an object',
          'object',
          computedDef
        );
      }

      const def = computedDef as ComputedItemDefinition;

      if (!def.get) {
        throw createValidationError(
          `computed.${computedName}.get`,
          'Computed must have a "get" FunctionValue'
        );
      }

      const getFn = validateFunctionValue(def.get, `computed.${computedName}.get`);

      result[computedName] = {
        get: getFn,
        set: def.set ? validateFunctionValue(def.set, `computed.${computedName}.set`) : undefined,
      };
    } catch (error) {
      context.errors.push({
        path: `computed.${computedName}`,
        message: error instanceof Error ? error.message : String(error),
        value: computedDef,
      });
    }
  }

  return result;
}