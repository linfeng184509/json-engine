import type { ValueParserFn } from '@json-engine/core-engine';
import type { Component } from 'vue';

/**
 * 插件声明（在 Schema 中使用）
 */
export interface PluginDeclaration {
  name: string;
  version?: string;
}

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
 * Ant Design 插件配置
 */
export interface AntdPluginConfig {
  theme?: {
    primaryColor?: string;
    borderRadius?: number;
    [key: string]: unknown;
  };
  components?: string[];
  locale?: string;
}

/**
 * Router 插件配置
 */
export interface RouterPluginConfig {
  mode?: 'hash' | 'history';
  base?: string;
  scrollBehavior?: 'top' | 'bottom' | 'preserve';
}

/**
 * ECharts 插件配置
 */
export interface EChartsPluginConfig {
  theme?: string | object;
  autoResize?: boolean;
  locale?: string;
}

/**
 * WebSocket 插件配置
 */
export interface WebSocketPluginConfig {
  url: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  topics?: string[];
}

/**
 * Storage 插件配置
 */
export interface StoragePluginConfig {
  prefix?: string;
  encrypt?: boolean;
  encryptKey?: string;
  sync?: boolean;
  type?: 'localStorage' | 'sessionStorage';
}

/**
 * Pinia 插件配置
 */
export interface PiniaPluginConfig {
  persist?: boolean;
  storage?: 'localStorage' | 'sessionStorage';
  key?: string;
}

/**
 * Auth 插件配置
 */
export interface AuthPluginConfig {
  permissionProvider?: unknown;
  pagePermissions?: Record<string, string>;
}

/**
 * I18n 插件配置
 */
export interface I18nPluginConfig {
  locale?: string;
  fallbackLocale?: string;
  messages?: Record<string, Record<string, string>>;
}

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

/**
 * Vue-JSON 插件接口
 */
export interface VueJsonPlugin {
  name: string;
  version: string;
  description?: string;
  configSchema?: object;
  valueTypes?: ValueTypeDefinition[];
  components?: PluginComponentDefinition[];
  scopeExtensions?: ScopeExtension[];
  runtimeExports?: RuntimeExport[];
  onInstall?: (context: PluginInstallContext) => void | Promise<void>;
  onUninstall?: () => void | Promise<void>;
}

/**
 * 值类型定义
 */
export interface ValueTypeDefinition {
  typeName: string;
  parser: ValueParserFn;
  resolver?: ValueResolverFn;
  typeGuard?: (value: unknown) => boolean;
  requiresBody?: boolean;
}

/**
 * 值运行时解析器
 */
export type ValueResolverFn = (value: unknown, context: unknown) => unknown;

/**
 * 插件组件定义
 */
export interface PluginComponentDefinition {
  name: string;
  component: Component;
  lazy?: boolean;
  init?: (registry: Map<string, unknown>) => boolean;
}

/**
 * Scope 扩展
 */
export interface ScopeExtension {
  key: string;
  factory: (config: unknown) => unknown;
}

/**
 * 运行时导出
 */
export interface RuntimeExport {
  name: string;
  factory: (...args: unknown[]) => unknown;
}

/**
 * 插件安装上下文
 */
export interface PluginInstallContext {
  config: unknown;
  registerValueType: (def: ValueTypeDefinition) => void;
  registerComponent: (def: PluginComponentDefinition) => void;
  extendScope: (ext: ScopeExtension) => void;
  addRuntimeExport: (exp: RuntimeExport) => void;
}

/**
 * 已注册插件信息
 */
export interface RegisteredPlugin {
  definition: VueJsonPlugin;
  installed: boolean;
  version: string;
}

export type { PluginDeclaration as PluginInfo };
