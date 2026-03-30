import type { ValueParserFn } from '@json-engine/core-engine';
import type { Component } from 'vue';

/**
 * 插件声明（在 Schema 中使用）
 */
export interface PluginDeclaration {
  /** 插件包名 */
  name: string;
  /** 版本范围 */
  version?: string;
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
 * Vue-JSON 插件接口
 */
export interface VueJsonPlugin {
  /** 插件名称 */
  name: string;
  /** 版本号 */
  version: string;
  /** 描述 */
  description?: string;
  /** 配置验证 Schema (JSON Schema Draft-07) */
  configSchema?: object;
  /** 值类型扩展 */
  valueTypes?: ValueTypeDefinition[];
  /** 组件注册 */
  components?: PluginComponentDefinition[];
  /** Core Scope 扩展 */
  scopeExtensions?: ScopeExtension[];
  /** 运行时工厂导出 */
  runtimeExports?: RuntimeExport[];
  /** 安装钩子 */
  onInstall?: (context: PluginInstallContext) => void | Promise<void>;
  /** 卸载钩子 */
  onUninstall?: () => void | Promise<void>;
}

/**
 * 值类型定义
 */
export interface ValueTypeDefinition {
  /** 类型名称 */
  typeName: string;
  /** 解析器函数 */
  parser: ValueParserFn;
  /** 运行时解析器 */
  resolver?: ValueResolverFn;
  /** 类型守卫 */
  typeGuard?: (value: unknown) => boolean;
  /** 是否需要 body 字段 */
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
  /** 组件名称 */
  name: string;
  /** Vue 组件 */
  component: Component;
  /** 是否延迟加载 */
  lazy?: boolean;
  /** 初始化函数 */
  init?: (registry: Map<string, unknown>) => boolean;
}

/**
 * Scope 扩展
 */
export interface ScopeExtension {
  /** Scope 键名 (如 _api, _ws) */
  key: string;
  /** 工厂函数 */
  factory: (config: unknown) => unknown;
}

/**
 * 运行时导出
 */
export interface RuntimeExport {
  /** 导出名称 */
  name: string;
  /** 工厂函数 */
  factory: (...args: unknown[]) => unknown;
}

/**
 * 插件安装上下文
 */
export interface PluginInstallContext {
  /** 插件配置 */
  config: unknown;
  /** 注册值类型 */
  registerValueType: (def: ValueTypeDefinition) => void;
  /** 注册组件 */
  registerComponent: (def: PluginComponentDefinition) => void;
  /** 扩展 Scope */
  extendScope: (ext: ScopeExtension) => void;
  /** 添加运行时导出 */
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