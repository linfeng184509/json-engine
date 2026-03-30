import type { ValueParserFn } from '@json-engine/core-engine';
import type { ApiCallValue } from '../types';

export function createApiCallParser(): ValueParserFn {
  return function parseApiCall(body: string): unknown {
    if (typeof body !== 'string') {
      return body;
    }

    try {
      const parsed = JSON.parse(body);
      
      if (!parsed.method || !parsed.url) {
        console.warn('[api-call-parser] Missing required fields: method, url');
        return { _type: 'api-call', ...parsed };
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
      throw new Error(
        `[api-call-parser] Failed to parse: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };
}

export const ApiCallParser = createApiCallParser();