## Why

当前 enterprise-admin 的 App.vue 包含大量 TypeScript 逻辑（路由、加载、状态管理、错误处理），违背了"纯 JSON 引擎"的设计理念。用户期望将整个应用转为由 JSON Schema 驱动，包括应用初始化、页面加载、路由切换等核心逻辑，实现完全的 Schema-Driven Architecture。

## What Changes

- 新增 `loadComponent(path, options)` API，支持从路径动态加载 Schema 并创建组件
- 新增 `PageLoader` 内置组件，在 Schema 中通过 `<PageLoader schemaPath="..." />` 加载子页面
- 新增 `app-root.json` Schema，定义应用根组件（初始化、路由、状态、渲染）
- 简化 `enterprise-admin/src/App.vue` 为极简 bootstrap（仅加载 app-root schema）
- 扩展 CoreScope 添加 `_loader` API 供 Schema 内部调用

## Capabilities

### New Capabilities

- `dynamic-schema-loader`: 动态 Schema 加载能力，支持 fetch + cache + validate + createComponent 全流程
- `page-loader-component`: PageLoader 组件，作为 Schema 中动态加载页面的桥梁
- `app-root-schema`: 应用根 Schema 定义规范，包含初始化、路由、页面切换、状态管理的 Schema 结构

### Modified Capabilities

- `component-factory`: 扩展 createComponent 支持动态 schema 引用和 PageLoader 注册
- `reactive-system`: 扩展 CoreScope 添加 `_loader` 和 `_router` API

## Impact

- `vue-json/runtime/schema-loader.ts` (新文件)
- `vue-json/runtime/component-factory.ts` (修改)
- `vue-json/components/PageLoader.vue` (新文件)
- `vue-json/src/index.ts` (新增导出)
- `vue-json/src/types/runtime.ts` (新增类型)
- `enterprise-admin/public/schemas/app-root.json` (新文件)
- `enterprise-admin/src/App.vue` (简化)