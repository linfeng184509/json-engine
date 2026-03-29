import type { PropType, ComponentObjectPropsOptions } from 'vue';
import type { PropsDefinition, PropDefinition, ValueType, ParserContext, PropertyValue, FunctionValue, ExpressionValue, StateRef, PropsRef, StructuredInput } from '../types';
import { createValidationError } from '../utils/error';

function isExpressionValue(value: unknown): value is ExpressionValue {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return obj._type === 'expression' && 'expression' in obj;
}

function isStateRef(value: unknown): value is StateRef {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return obj._type === 'state' && typeof obj.variable === 'string';
}

function isPropsRef(value: unknown): value is PropsRef {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return obj._type === 'props' && typeof obj.variable === 'string';
}

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

function isPropertyValue(value: unknown): value is PropertyValue {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'object') return true;
  
  const obj = value as Record<string, unknown>;
  if (typeof obj._type === 'string') {
    return ['expression', 'state', 'props', 'scope'].includes(obj._type);
  }
  return false;
}

function isFunctionValue(value: unknown): value is FunctionValue {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return obj._type === 'function' && typeof obj.body === 'string';
}

function parsePropertyValue(value: PropertyValue | StructuredInput): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'object') {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }

  if (isExpressionValue(value)) {
    throw createValidationError(
      'default',
      'Expression values in prop defaults are not supported at parse time. Use runtime evaluation.',
      'literal value',
      value as unknown
    );
  }

  if (isStateRef(value) || isPropsRef(value)) {
    throw createValidationError(
      'default',
      'State/Props references in prop defaults are not supported at parse time. Use runtime evaluation.',
      'literal value',
      value as unknown
    );
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
        if (!isPropertyValue(def.default)) {
          throw createValidationError(
            `props.${propName}.default`,
            'Default must be a literal value or structured value',
            'PropertyValue',
            def.default
          );
        }
        propOption.default = () => parsePropertyValue(def.default);
      }

      if (def.validator) {
        if (!isFunctionValue(def.validator)) {
          throw createValidationError(
            `props.${propName}.validator`,
            'Validator must be a FunctionValue',
            'FunctionValue',
            def.validator
          );
        }
        propOption.validator = new Function('value', `"use strict"; ${def.validator.body}`) as (
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
