# vue-json-engine

## Why

目前前端开发中，JSON 作为配置数据格式被广泛使用，但将 JSON 动态转换为可运行的 Vue 组件需要大量手动编码。现有方案（如 JSON Schema Form）主要聚焦于表单场景，缺乏通用的 JSON-to-Vue 运行时转换能力。

**vue-json-engine** 旨在提供一套完整的运行时 JSON 解析引擎，将 JSON Schema 转换为可执行的 Vue 3 组件，支持完整的 Vue 核心能力（响应式系统、模板指令、组件系统、生命周期），使开发者能够通过 JSON 描述动态生成 Vue 应用。

## What Changes

### 新增能力

- **JSON Schema 解析器**：支持将 JSON Schema 解析为 Vue 组件定义
- **运行时渲染引擎**：使用 Vue Core API (`h()`, `defineComponent`) 在运行时生成渲染函数
- **响应式系统集成**：支持 `ref`, `reactive`, `computed`, `watch`, `watchEffect`, `provide`, `inject` 等
- **模板指令支持**：支持 `v-if`, `v-for`, `v-show`, `v-model`, `v-bind`, `v-on`, `v-slot` 等指令
- **生命周期钩子**：支持所有 Vue 3 生命周期钩子（`onMounted`, `onUnmounted`, `onUpdated` 等）
- **组件系统**：支持已注册组件解析和异步组件加载
- **样式注入**：支持运行时样式注入，包括 scoped CSS
- **TypeScript 类型生成**：从 JSON Schema 自动生成 TypeScript 类型定义

### 集成点

- 依赖 `@json-engine/core-engine` 进行 JSON 解析和值转换
- 使用 `parseJson` 预处理 JSON Schema
- 使用 `KeyParser` 解析 JSON 键名映射
- 使用 `ValueParser` 解析表达式和嵌套引用

## Capabilities

### New Capabilities

- `json-schema-parser`: JSON Schema 结构解析和验证
- `reactive-system`: 响应式状态管理（ref, reactive, computed, watch 等）
- `render-engine`: 运行时渲染函数生成（h() 包装）
- `directive-runtime`: 模板指令运行时实现（v-if, v-for, v-model 等）
- `lifecycle-hooks`: 生命周期钩子集成
- `component-factory`: 组件工厂，支持本地组件和异步组件
- `style-injector`: 运行时样式注入，支持 scoped CSS
- `type-generator`: TypeScript 类型定义生成

### Modified Capabilities

无（全新项目）

## Impact

### 代码影响

- 新增 `src/packages/vue-json/` 目录
- 更新根目录 `package.json` 的 workspaces 配置

### API 影响

- 新增 `@json-engine/vue-json` 包
- 导出 composables：`useVueJson`, `useJsonComponent`, `useJsonRenderer`
- 导出运行时 API：`createComponent`, `renderVNode`, `injectStyles`
- 导出解析器 API：`parseSchema`, `parseProps`, `parseState`, `parseComputed` 等

### 依赖影响

- 新增 `vue@^3.4.0` 作为 peer dependency
- 依赖 `@json-engine/core-engine@*` 作为内部依赖

### 兼容性

- 仅支持 Vue 3
- 目标环境：现代浏览器（ES2022+）
- 模块格式：ESM