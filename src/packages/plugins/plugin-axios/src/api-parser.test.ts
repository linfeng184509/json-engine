import { describe, it, expect } from 'vitest';
import { createApiCallParser } from './parser/api-parser';

describe('ApiCallParser', () => {
  const parseApiCall = createApiCallParser();

  it('should parse valid api-call JSON string', () => {
    const input = JSON.stringify({
      method: 'GET',
      url: '/api/users',
      params: { page: 1 },
    });

    const result = parseApiCall(input);

    expect(result).toEqual({
      _type: 'api-call',
      method: 'GET',
      url: '/api/users',
      params: { page: 1 },
    });
  });

  it('should uppercase method', () => {
    const input = JSON.stringify({
      method: 'get',
      url: '/api/users',
    });

    const result = parseApiCall(input) as { method: string };

    expect(result.method).toBe('GET');
  });

  it('should include data and headers when provided', () => {
    const input = JSON.stringify({
      method: 'POST',
      url: '/api/users',
      data: { name: 'John' },
      headers: { 'Content-Type': 'application/json' },
    });

    const result = parseApiCall(input);

    expect(result).toMatchObject({
      _type: 'api-call',
      method: 'POST',
      url: '/api/users',
      data: { name: 'John' },
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('should throw on invalid JSON string', () => {
    const input = 'not valid json';
    expect(() => parseApiCall(input)).toThrow('[api-call-parser]');
  });

  it('should throw error for missing required fields', () => {
    const input = JSON.stringify({ method: 'GET' });
    expect(() => parseApiCall(input)).toThrow('[api-call-parser]');
  });

  it('should handle non-string input', () => {
    const input = { method: 'POST', url: '/api/test' };
    const result = parseApiCall(input as any);

    expect(result).toEqual(input);
  });
});
