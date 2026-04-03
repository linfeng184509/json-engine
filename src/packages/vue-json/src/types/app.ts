import type { Platform } from './platform';
import type { PluginDeclaration } from './plugin.definitions';
import type { VueJsonSchema } from './schema';
import type {
  AxiosPluginConfig,
  AntdPluginConfig,
  RouterPluginConfig,
  EChartsPluginConfig,
  WebSocketPluginConfig,
  StoragePluginConfig,
  PiniaPluginConfig,
  AuthPluginConfig,
  I18nPluginConfig,
} from './plugin.definitions';

export type { PluginDeclaration };

/**
 * 插件配置集合
 */
export interface PluginConfig {
  axios?: AxiosPluginConfig;
  antd?: AntdPluginConfig;
  router?: RouterPluginConfig;
  echarts?: EChartsPluginConfig;
  websocket?: WebSocketPluginConfig;
  storage?: StoragePluginConfig;
  pinia?: PiniaPluginConfig;
  auth?: AuthPluginConfig;
  i18n?: I18nPluginConfig;
}

export interface UIComponentConfig {
  name: string;
  component: unknown;
}

export interface UIThemeConfig {
  primaryColor?: string;
  borderRadius?: number;
  [key: string]: unknown;
}

export interface UIConfig {
  components?: UIComponentConfig[];
  theme?: UIThemeConfig;
}

export interface AxiosRequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  auth?: { username: string; password: string };
}

export interface AxiosRetryConfig {
  retries?: number;
  retryDelay?: number;
}

export interface WSConfig {
  url: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  topics?: string[];
}

export interface NetworkConfig {
  axios?: AxiosRequestConfig & { retry?: AxiosRetryConfig };
  websocket?: WSConfig[];
}

export interface StorageConfig {
  prefix?: string;
  encrypt?: boolean;
  encryptKey?: string;
  sync?: boolean;
}

export interface I18nLocaleConfig {
  messages: Record<string, string>;
}

export interface I18nConfig {
  locale?: string;
  fallbackLocale?: string;
  messages?: Record<string, I18nLocaleConfig>;
}

export interface AuthConfig {
  permissionProvider?: unknown;
  pagePermissions?: Record<string, string>;
}

export interface VueJsonAppSchema {
  name: string;
  version?: string;
  root?: VueJsonSchema | string;
  plugins?: PluginDeclaration[];
  config?: PluginConfig;
  router?: unknown;
  stores?: Record<string, unknown>;
  ui?: UIConfig;
  network?: NetworkConfig;
  storage?: StorageConfig;
  i18n?: I18nConfig;
  auth?: AuthConfig;
  platform?: Platform;
}

export class SchemaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}