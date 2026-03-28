import type { MethodsDefinition, ParserContext } from '../types';
import { createValidationError } from '../utils/error';

export function parseMethods(
  definition: MethodsDefinition,
  context: ParserContext
): MethodsDefinition {
  const result: MethodsDefinition = {};

  for (const [methodName, methodBody] of Object.entries(definition)) {
    try {
      if (typeof methodBody !== 'string') {
        throw createValidationError(
          `methods.${methodName}`,
          'Method body must be a string',
          'string',
          methodBody
        );
      }

      result[methodName] = methodBody;
    } catch (error) {
      context.errors.push({
        path: `methods.${methodName}`,
        message: error instanceof Error ? error.message : String(error),
        value: methodBody,
      });
    }
  }

  return result;
}