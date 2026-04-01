import type { ValueParserFn } from '@json-engine/core-engine';
import { createError } from '@json-engine/core-engine';
import type { ApiCallValue } from '../types';

export function createApiCallParser(): ValueParserFn {
  return function parseApiCall(body: string): unknown {
    if (typeof body !== 'string') {
      return body;
    }

    try {
      const parsed = JSON.parse(body);
      
      if (!parsed.method || !parsed.url) {
        throw createError(
          'api-call-parser',
          'Missing required fields: method, url',
          '{"method": "GET", "url": "/api/..."}'
        );
      }

      return {
        _type: 'api-call',
        method: parsed.method.toUpperCase(),
        url: parsed.url,
        params: parsed.params,
        data: parsed.data,
        headers: parsed.headers,
      } as ApiCallValue;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('[api-call-parser]')) {
        throw error;
      }
      throw createError(
        'api-call-parser',
        `Failed to parse: ${error instanceof Error ? error.message : String(error)}`,
        '{"method": "GET", "url": "/api/..."}'
      );
    }
  };
}

export const ApiCallParser = createApiCallParser();