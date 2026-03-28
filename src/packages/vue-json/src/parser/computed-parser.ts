import type { ComputedDefinition, ParserContext } from '../types';
import { createValidationError } from '../utils/error';

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

      const def = computedDef as { get: string; set?: string };

      if (!def.get || typeof def.get !== 'string') {
        throw createValidationError(
          `computed.${computedName}.get`,
          'Computed must have a "get" function body string'
        );
      }

      result[computedName] = {
        get: def.get,
        set: def.set,
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