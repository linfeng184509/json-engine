import type { RenderContext } from '@json-engine/vue-json';
import type { ApiCallValue } from '../types';

export function resolveApiCall(value: unknown, context: RenderContext): Promise<unknown> {
  if (!value || typeof value !== 'object') {
    return Promise.resolve(value);
  }

  const v = value as Record<string, unknown>;
  if (v._type !== 'api-call') {
    return Promise.resolve(value);
  }

  const apiCall = v as unknown as ApiCallValue;
  const _ = (context as any)._ || {};
  const api = _._api;

  if (!api) {
    console.warn('[api-resolver] _api not available in context');
    return Promise.resolve(value);
  }

  const { method, url, params, data, headers } = apiCall;

  switch (method) {
    case 'GET':
      return api.get(url, { params, headers });
    case 'POST':
      return api.post(url, data, { headers });
    case 'PUT':
      return api.put(url, data, { headers });
    case 'DELETE':
      return api.delete(url, { headers });
    case 'PATCH':
      return api.patch?.(url, data, { headers }) || Promise.resolve(value);
    default:
      console.warn(`[api-resolver] Unsupported method: ${method}`);
      return Promise.resolve(value);
  }
}