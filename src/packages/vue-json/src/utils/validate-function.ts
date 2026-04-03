import type { FunctionValue } from '../types';
import { isFunctionParseData } from '@json-engine/core-engine';
import { createValidationError } from './error';

export function validateFunctionValue(fn: unknown, path: string): FunctionValue {
  if (!isFunctionParseData(fn)) {
    throw createValidationError(
      path,
      'Must be a FunctionValue with _type="function"',
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
