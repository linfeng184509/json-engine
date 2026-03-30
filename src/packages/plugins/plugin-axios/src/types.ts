/**
 * Axios 插件配置
 */
export interface AxiosPluginConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  retry?: {
    count: number;
    delay: number;
  };
}

/**
 * API 调用值类型
 */
export interface ApiCallValue {
  _type: 'api-call';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
}

/**
 * CoreScope._api 接口
 */
export interface CoreScopeApi {
  get: (url: string, options?: Record<string, unknown>) => Promise<unknown>;
  post: (url: string, data?: unknown, options?: Record<string, unknown>) => Promise<unknown>;
  put: (url: string, data?: unknown, options?: Record<string, unknown>) => Promise<unknown>;
  delete: (url: string, options?: Record<string, unknown>) => Promise<unknown>;
}