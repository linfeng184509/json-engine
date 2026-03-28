import type { LifecycleDefinition, ParserContext } from '../types';
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

function parseHookValue(value: string | string[] | undefined): string[] | undefined {
  if (!value) return undefined;

  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === 'string');
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
        if (typeof hookValue !== 'string' && !Array.isArray(hookValue)) {
          throw createValidationError(
            `lifecycle.${hookName}`,
            'Lifecycle hook must be a string or array of strings',
            'string | string[]',
            hookValue
          );
        }

        const parsed = parseHookValue(hookValue);
        if (parsed && parsed.length > 0) {
          result[hookName] = parsed;
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