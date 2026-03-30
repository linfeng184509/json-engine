import type { AxiosPluginConfig, CoreScopeApi } from '../types';

export function createApiScope(config: AxiosPluginConfig): CoreScopeApi {
  const timeout = config.timeout || 10000;
  const baseURL = config.baseURL || '';
  const defaultHeaders = config.headers || {};

  async function request(
    method: string,
    url: string,
    data?: unknown,
    options?: Record<string, unknown>
  ): Promise<unknown> {
    const fullUrl = baseURL + url;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
      ...(options?.headers as Record<string, string> || {}),
    };

    try {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // localStorage not available
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  return {
    get: (url, options) => request('GET', url, undefined, options),
    post: (url, data, options) => request('POST', url, data, options),
    put: (url, data, options) => request('PUT', url, data, options),
    delete: (url, options) => request('DELETE', url, undefined, options),
  };
}