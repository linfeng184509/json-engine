## Why

当前 vue-json 核心包耦合了太多功能实现（axios、router、echarts、websocket、storage、pinia、auth、i18n），导致：
1. 核心包体积过大，无法按需加载
2. 用户无法选择替代方案（如用 axios 替代 fetch）
3. 版本更新困难，所有功能必须同步发布
4. peerDependencies 无法精确管理

通过插件化重构，用户可以通过 JSON Schema 声明式选择所需功能，实现真正的按需加载和灵活配置。

## What Changes

### 新建 9 个独立插件包

| 插件 | 功能 | peerDependencies |
|------|------|------------------|
| @json-engine/plugin-axios | HTTP 客户端 | axios |
| @json-engine/plugin-antd | UI 组件库 | ant-design-vue |
| @json-engine/plugin-router | 路由管理 | vue-router |
| @json-engine/plugin-echarts | 图表组件 | echarts |
| @json-engine/plugin-websocket | WebSocket | - |
| @json-engine/plugin-storage | 浏览器存储 | - |
| @json-engine/plugin-pinia | 状态管理 | pinia |
| @json-engine/plugin-auth | 权限认证 | - |
| @json-engine/plugin-i18n | 国际化 | vue-i18n |

### 核心包变更

- **新增** `plugin/` 目录：插件注册表、版本验证、配置验证
- **新增** `types/plugin.ts`：插件类型定义
- **修改** Schema 结构：添加 `plugins` 和 `config` 字段
- **修改** CoreScope：仅保留 `_loader`，其他由插件扩展
- **删除** 迁移到插件的 runtime/parser/types/components 文件
- **BREAKING** 移除核心包中的硬编码功能实现

## Capabilities

### New Capabilities

- `plugin-system`: 插件注册表、版本验证、配置验证、Scope 扩展机制
- `plugin-axios`: Axios HTTP 客户端集成，提供 `_api` Scope
- `plugin-antd`: Ant Design Vue 组件注册和主题配置
- `plugin-router`: Vue Router 集成，提供 `_router` Scope
- `plugin-echarts`: ECharts 图表组件和 option 解析器
- `plugin-websocket`: WebSocket 连接管理，提供 `_ws` Scope
- `plugin-storage`: localStorage/sessionStorage 封装，提供 `_storage` Scope
- `plugin-pinia`: Pinia 状态管理集成
- `plugin-auth`: 权限检查、字段权限、SOP 权限，提供 `_auth` Scope
- `plugin-i18n`: 国际化支持，提供 `_i18n` Scope

### Modified Capabilities

- `component-factory`: 移除 ECharts 组件的特殊注册逻辑，改为从插件获取
- `echarts-component`: **移除** - 迁移到 plugin-echarts
- `echarts-option-parser`: **移除** - 迁移到 plugin-echarts
- `echarts-reactive-update`: **移除** - 迁移到 plugin-echarts

## Impact

### 文件变更

**新增目录**:
- `src/packages/plugins/plugin-axios/`
- `src/packages/plugins/plugin-antd/`
- `src/packages/plugins/plugin-router/`
- `src/packages/plugins/plugin-echarts/`
- `src/packages/plugins/plugin-websocket/`
- `src/packages/plugins/plugin-storage/`
- `src/packages/plugins/plugin-pinia/`
- `src/packages/plugins/plugin-auth/`
- `src/packages/plugins/plugin-i18n/`

**新增文件**:
- `src/packages/vue-json/src/plugin/` - 插件系统核心
- `src/packages/vue-json/src/types/plugin.ts` - 类型定义

**删除文件** (迁移到插件):
- `src/packages/vue-json/src/runtime/network-factory.ts`
- `src/packages/vue-json/src/runtime/ui-factory.ts`
- `src/packages/vue-json/src/runtime/router-factory.ts`
- `src/packages/vue-json/src/runtime/echarts-factory.ts`
- `src/packages/vue-json/src/runtime/storage-factory.ts`
- `src/packages/vue-json/src/runtime/store-factory.ts`
- `src/packages/vue-json/src/runtime/permission-*.ts`
- `src/packages/vue-json/src/runtime/auth-directive.ts`
- `src/packages/vue-json/src/runtime/i18n-factory.ts`
- `src/packages/vue-json/src/components/EChartsComponent.ts`
- `src/packages/vue-json/src/parser/echarts-option-parser.ts`
- `src/packages/vue-json/src/types/echarts.ts`
- `src/packages/vue-json/src/types/router.ts`
- `src/packages/vue-json/src/types/store.ts`
- `src/packages/vue-json/src/types/auth.ts`

**修改文件**:
- `src/packages/vue-json/src/types/app.ts`
- `src/packages/vue-json/src/runtime/app-factory.ts`
- `src/packages/vue-json/src/composables/use-core-scope.ts`
- `src/packages/vue-json/src/runtime/value-resolver.ts`
- `src/packages/vue-json/src/index.ts`
- `package.json` - workspaces
- `tsconfig.json` - paths

### 版本绑定

插件版本与核心包版本绑定：主版本 + 次版本必须匹配，修订号可不同。