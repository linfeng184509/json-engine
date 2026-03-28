import type { WatchDefinition, WatchItemDefinition, ParserContext } from '../types';
import { createValidationError } from '../utils/error';

export function parseWatch(
  definition: WatchDefinition,
  context: ParserContext
): WatchDefinition {
  const result: WatchDefinition = {};

  for (const [watchName, watchDef] of Object.entries(definition)) {
    try {
      if (typeof watchDef !== 'object' || watchDef === null) {
        throw createValidationError(
          `watch.${watchName}`,
          'Watch definition must be an object',
          'object',
          watchDef
        );
      }

      const def = watchDef as WatchItemDefinition;

      if (!def.source || typeof def.source !== 'string') {
        throw createValidationError(
          `watch.${watchName}.source`,
          'Watch must have a "source" string'
        );
      }

      if (!def.handler || typeof def.handler !== 'string') {
        throw createValidationError(
          `watch.${watchName}.handler`,
          'Watch must have a "handler" function body string'
        );
      }

      result[watchName] = {
        source: def.source,
        handler: def.handler,
        immediate: def.immediate,
        deep: def.deep,
        flush: def.flush,
        type: def.type || 'watch',
      };
    } catch (error) {
      context.errors.push({
        path: `watch.${watchName}`,
        message: error instanceof Error ? error.message : String(error),
        value: watchDef,
      });
    }
  }

  return result;
}