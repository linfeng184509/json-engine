import type { ComputedDefinition, ComputedItemDefinition, ParserContext, FunctionValue } from '../types';
import { isFunctionValue } from '../runtime/value-resolver';
import { createValidationError } from '../utils/error';

function validateFunctionValue(fn: unknown, path: string): FunctionValue {
  if (!isFunctionValue(fn)) {
    throw createValidationError(
      path,
      'Must be a FunctionValue with _type="function", params, and body',
      '{ _type: "function", params: {}, body: "..." }',
      fn
    );
  }

  if (typeof fn.body !== 'string') {
    throw createValidationError(
      `${path}.body`,
      'FunctionValue.body must be a string',
      'string',
      fn.body
    );
  }

  if (typeof fn.params !== 'object' || fn.params === null) {
    throw createValidationError(
      `${path}.params`,
      'FunctionValue.params must be an object',
      'object',
      fn.params
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