import type { AxiosPluginConfig } from '../types';

export interface AxiosInstance {
  get: (url: string, config?: unknown) => Promise<unknown>;
  post: (url: string, data?: unknown, config?: unknown) => Promise<unknown>;
  put: (url: string, data?: unknown, config?: unknown) => Promise<unknown>;
  delete: (url: string, config?: unknown) => Promise<unknown>;
}

export function createAxiosInstance(config: AxiosPluginConfig): AxiosInstance {
  const timeout = config.timeout || 10000;
  const baseURL = config.baseURL || '';
  const defaultHeaders = config.headers || {};

  async function request(
    method: string,
    url: string,
    data?: unknown
  ): Promise<unknown> {
    const fullUrl = baseURL + url;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };

    try {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // localStorage not available
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullUrl, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
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
    get: (url) => request('GET', url),
    post: (url, data) => request('POST', url, data),
    put: (url, data) => request('PUT', url, data),
    delete: (url) => request('DELETE', url),
  };
}