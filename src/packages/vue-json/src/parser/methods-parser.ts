import type { MethodsDefinition, ParserContext, FunctionValue } from '../types';
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

export function parseMethods(
  definition: MethodsDefinition,
  context: ParserContext
): MethodsDefinition {
  const result: MethodsDefinition = {};

  for (const [methodName, methodValue] of Object.entries(definition)) {
    try {
      const fn = validateFunctionValue(methodValue, `methods.${methodName}`);
      result[methodName] = fn;
    } catch (error) {
      context.errors.push({
        path: `methods.${methodName}`,
        message: error instanceof Error ? error.message : String(error),
        value: methodValue,
      });
    }
  }

  return result;
}