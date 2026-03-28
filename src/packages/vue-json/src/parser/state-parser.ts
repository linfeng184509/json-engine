import type { StateDefinition, StateItemDefinition, ParserContext } from '../types';
import { createValidationError } from '../utils/error';

export function parseState(
  definition: StateDefinition,
  context: ParserContext
): StateDefinition {
  const result: StateDefinition = {};

  for (const [stateName, stateDef] of Object.entries(definition)) {
    try {
      if (typeof stateDef !== 'object' || stateDef === null) {
        throw createValidationError(
          `state.${stateName}`,
          'State definition must be an object',
          'object',
          stateDef
        );
      }

      const def = stateDef as StateItemDefinition;

      if (!def.type) {
        context.warnings.push({
          path: `state.${stateName}`,
          message: 'State type not specified, defaulting to "ref"',
          suggestion: 'Add type: "ref" or "reactive"',
        });
      }

      result[stateName] = {
        type: def.type || 'ref',
        initial: def.initial,
        source: def.source,
        key: def.key,
      };
    } catch (error) {
      context.errors.push({
        path: `state.${stateName}`,
        message: error instanceof Error ? error.message : String(error),
        value: stateDef,
      });
    }
  }

  return result;
}