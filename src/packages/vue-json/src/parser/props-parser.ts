import type { PropType, ComponentObjectPropsOptions } from 'vue';
import type { PropsDefinition, PropDefinition, ValueType, ParserContext } from '../types';
import { createValidationError } from '../utils/error';

const TYPE_MAP: Record<ValueType, unknown> = {
  String: String,
  Number: Number,
  Boolean: Boolean,
  Array: Array,
  Object: Object,
  Function: Function,
  Symbol: Symbol,
  BigInt: BigInt,
};

function parsePropType(type: ValueType | ValueType[] | undefined): PropType<unknown> | undefined {
  if (!type) return undefined;

  if (Array.isArray(type)) {
    return type.map((t) => TYPE_MAP[t]).filter(Boolean) as PropType<unknown>;
  }

  return TYPE_MAP[type] as PropType<unknown>;
}

function parseDefaultValue(value: unknown): unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export function parseProps(
  definition: PropsDefinition,
  context: ParserContext
): ComponentObjectPropsOptions {
  const result: ComponentObjectPropsOptions = {};

  for (const [propName, propDef] of Object.entries(definition)) {
    try {
      if (typeof propDef !== 'object' || propDef === null) {
        throw createValidationError(
          `props.${propName}`,
          'Property definition must be an object',
          'object',
          propDef
        );
      }

      const def = propDef as PropDefinition;
      const propOption: Record<string, unknown> = {};

      if (def.type) {
        propOption.type = parsePropType(def.type);
      }

      if (def.required === true) {
        propOption.required = true;
      }

      if (def.default !== undefined) {
        propOption.default = typeof def.default === 'function' ? def.default : () => parseDefaultValue(def.default);
      }

      if (def.validator) {
        propOption.validator = new Function('value', `"use strict"; ${def.validator}`) as (
          value: unknown
        ) => boolean;
      }

      result[propName] = propOption;
    } catch (error) {
      context.errors.push({
        path: `props.${propName}`,
        message: error instanceof Error ? error.message : String(error),
        value: propDef,
      });
    }
  }

  return result;
}