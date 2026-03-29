## Why

vue-json 需要从简单的组件引擎扩展为完整的应用引擎，支持企业级应用开发需求：多终端适配（PC浏览器、PC客户端、PDA、平板）、插件系统（UI组件库、网络请求、本地存储）、国际化、SOP流程控制、权限机制等能力。

## What Changes

### 应用级能力
- **App 配置系统**: 支持多文件 Schema 组织（app.json、router.json、stores/、pages/）
- **插件系统**: 支持 Vue 生态插件（vue-router、pinia）
- **UI 组件库集成**: 支持 ant-design-vue 等组件库自动注册、主题配置
- **网络请求**: 集成 axios 配置（拦截器、重试、超时）、WebSocket（自动重连、心跳、消息绑定）
- **本地存储**: localStorage/sessionStorage 自动持久化、双向同步、加密支持
- **国际化**: vue-i18n 集成、多语言包配置、语言切换

### 多终端适配
- **平台检测**: 自动识别 pc-browser/pc-client/pda/pad 四种设备
- **平台配置**: 各平台独立页面 Schema、菜单、路由
- **功能特性**: 根据平台启用/禁用相应功能（扫码、NFC、打印等）

### 权限机制框架
- **PermissionProvider**: 可插拔的权限数据接口
- **PermissionChecker**: has/hasAny/hasAll/hasRole 等检查方法
- **字段权限**: read/write/hidden/privacy 四级控制
- **数据过滤器**: 自动过滤、隐私掩码处理
- **SOP 流程控制**: 按步骤检查权限和可用字段

## Capabilities

### New Capabilities

#### 应用层
- `app-schema`: 应用入口 Schema，支持多文件引用
- `router-factory`: 路由配置解析、动态路由注册、路由守卫
- `store-factory`: Pinia store 创建、模块化配置
- `ui-integration`: UI 组件库集成、全局注册、主题配置
- `network-factory`: axios 配置、WebSocket 连接管理
- `storage-factory`: 本地存储持久化、自动同步、加密
- `i18n-factory`: 国际化配置、语言包加载、动态切换

#### 多终端
- `platform-detector`: 设备类型检测（pc-browser/pc-client/pda/pad）
- `multi-platform-config`: 各平台独立配置、菜单过滤

#### 权限
- `permission-provider`: 权限数据来源接口
- `permission-checker`: 基础权限检查方法
- `field-permission`: 字段级别权限控制
- `data-filter`: 数据过滤和隐私掩码
- `sop-permission`: SOP 流程步骤权限
- `auth-directive`: 声明式权限指令

### Modified Capabilities

- `reactive-system`: 扩展 Core Scope 增加 auth/api/ws/storage/i18n 等服务
- `json-schema-parser`: 支持 Schema 引用（import）、权限字段解析
- `component-factory`: 支持权限指令处理、平台过滤

## Impact

| 模块 | 影响 |
|------|------|
| vue-json/types | 新增 AppSchema、RouterConfig、StoreConfig、UIConfig、NetworkConfig、StorageConfig、I18nConfig、AuthConfig 等类型 |
| vue-json/runtime | 新增 app-factory.ts、router-factory.ts、store-factory.ts、ui-factory.ts、network-factory.ts、storage-factory.ts、i18n-factory.ts、auth-factory.ts、platform-detector.ts、data-filter.ts |
| vue-json/composables | 新增 useVueApp、useAuth、useI18n 等 |
| vue-json/parser | 支持 import 引用解析 |
| core-engine | 无影响 |
