import type { StateDefinition, StateItemDefinition, ParserContext, InitialValue } from '../types';
import { createValidationError } from '../utils/error';

function isInitialValue(value: unknown): value is InitialValue {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'object') return true;

  const obj = value as Record<string, unknown>;
  if (typeof obj.type === 'string') {
    return ['expression', 'state', 'props', 'scope'].includes(obj.type);
  }
  return true;
}

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

      const validTypes = ['ref', 'reactive', 'shallowRef', 'shallowReactive', 'toRef', 'toRefs', 'readonly'];
      if (def.type && !validTypes.includes(def.type)) {
        throw createValidationError(
          `state.${stateName}.type`,
          `Invalid state type: "${def.type}". Must be one of: ${validTypes.join(', ')}`,
          validTypes.join(' | '),
          def.type
        );
      }

      if (def.initial !== undefined && !isInitialValue(def.initial)) {
        throw createValidationError(
          `state.${stateName}.initial`,
          'Initial value must be a literal or structured value',
          'InitialValue',
          def.initial
        );
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