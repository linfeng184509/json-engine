import type { LifecycleDefinition, ParserContext, FunctionValue } from '../types';
import { createValidationError } from '../utils/error';

const LIFECYCLE_HOOKS = [
  'onMounted',
  'onUnmounted',
  'onUpdated',
  'onBeforeMount',
  'onBeforeUnmount',
  'onBeforeUpdate',
  'onErrorCaptured',
  'onActivated',
  'onDeactivated',
] as const;

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

function parseHookValue(value: FunctionValue | FunctionValue[] | undefined, path: string): FunctionValue[] | undefined {
  if (!value) return undefined;

  if (isFunctionValue(value)) {
    return [validateFunctionValue(value, path)];
  }

  if (Array.isArray(value)) {
    return value.map((v, i) => validateFunctionValue(v, `${path}[${i}]`));
  }

  return undefined;
}

export function parseLifecycle(
  definition: LifecycleDefinition,
  context: ParserContext
): LifecycleDefinition {
  const result: LifecycleDefinition = {};

  for (const hookName of LIFECYCLE_HOOKS) {
    const hookValue = definition[hookName];

    try {
      if (hookValue !== undefined) {
        const parsed = parseHookValue(hookValue as FunctionValue | FunctionValue[] | undefined, `lifecycle.${hookName}`);
        if (parsed && parsed.length > 0) {
          result[hookName] = parsed.length === 1 ? parsed[0] : parsed;
        }
      }
    } catch (error) {
      context.errors.push({
        path: `lifecycle.${hookName}`,
        message: error instanceof Error ? error.message : String(error),
        value: hookValue,
      });
    }
  }

  return result;
}