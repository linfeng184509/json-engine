import type { ValueParserFn } from '@json-engine/core-engine';
import { createError } from '@json-engine/core-engine';
import type { ApiCallValue } from '../types';

function isParseError(error: unknown): error is { code: string; parser: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'parser' in error &&
    'message' in error
  );
}

export function createApiCallParser(): ValueParserFn {
  return function parseApiCall(body: string): unknown {
    if (typeof body !== 'string') {
      return body;
    }

    try {
      const parsed = JSON.parse(body);
      
      if (!parsed.method || !parsed.url) {
        const parseError = createError(
          'api-call-parser',
          'Missing required fields: method, url',
          '{"method": "GET", "url": "/api/..."}'
        );
        throw new Error(parseError.message);
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
      if (isParseError(error) && error.parser === 'api-call-parser') {
        throw new Error(error.message);
      }
      if (error instanceof Error && error.message.includes('api-call-parser')) {
        throw error;
      }
      const parseError = createError(
        'api-call-parser',
        `Failed to parse: ${error instanceof Error ? error.message : String(error)}`,
        '{"method": "GET", "url": "/api/..."}'
      );
      throw new Error(parseError.message);
    }
  };
}

export const ApiCallParser = createApiCallParser();
