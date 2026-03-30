## Why

ECharts 是企业级应用中最常用的图表库之一。当前 vue-json 框架虽然支持声明式组件注册，但缺少对 ECharts 的原生支持，导致用户无法通过 JSON Schema 直接定义图表组件。本功能将为 vue-json 添加 ECharts 集成，使用户能够通过 JSON 配置创建响应式图表。

## What Changes

- 新增 `ECharts` 组件，可通过 JSON Schema 声明式创建图表
- 新增 `echarts-option` 值类型解析器，支持在 schema 中定义 ECharts 配置
- 支持响应式数据绑定：当 state 中的数据变化时，图表自动更新
- 支持容器大小自适应（autoResize）
- 支持主题配置和加载状态
- **BREAKING**: 需要在项目中安装 `echarts` 包（peer dependency）

## Capabilities

### New Capabilities

- `echarts-component`: 支持通过 JSON Schema 声明 ECharts 图表组件，包含组件封装、生命周期管理、自动销毁等
- `echarts-option-parser`: 新增值解析器，支持在 JSON 中定义 ECharts 配置对象，支持表达式引用
- `echarts-reactive-update`: 支持响应式更新，当绑定的数据变化时自动调用 setOption 更新图表

### Modified Capabilities

- `component-registration`: 修改组件注册机制，支持运行时动态注册 ECharts 组件到全局

## Impact

- **新增文件**: `src/packages/vue-json/src/runtime/echarts-factory.ts`
- **新增文件**: `src/packages/vue-json/src/components/EChartsComponent.ts`
- **新增文件**: `src/packages/vue-json/src/types/echarts.ts`
- **修改文件**: `src/packages/vue-json/src/config/vue-parser-config.ts` - 注册新的解析器
- **修改文件**: `src/packages/vue-json/src/components/index.ts` - 导出 ECharts 组件
- **修改文件**: `src/packages/vue-json/src/index.ts` - 导出公共 API
- **新增依赖**: `echarts` (peer dependency，版本 >=5.0.0)
- **影响范围**: 使用 vue-json 的所有应用，向后兼容
