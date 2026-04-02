## Why

需要创建一个独立项目展示所有 ant-design-vue 组件的 JSON Schema demo，验证 `enhance-vue-json-for-antd-demo` 扩展能力的有效性，并为开发者提供可直接参考的 demo 集合。

当前已完成 vue-json 能力扩展（v-model 带参数、Icon 注册、插槽渲染、高级 API scope），需要一个完整的演示项目来验证这些能力，并展示如何使用 JSON Schema 编写 antd 组件 demo。

## What Changes

- 创建 `src/packages/antd-demo-playground` 独立子项目
- 配置 plugin-antd 并启用 `includeIcons: true` 注册所有图标
- 转换 76 个 antd 组件的 ~500+ demo 为 JSON Schema
- 实现侧边栏导航 + demo 展示布局
- 支持 demo 源码查看功能（展示 JSON Schema）
- 按组件分类组织导航结构

## Capabilities

### New Capabilities

- `antd-demo-playground`: 完整的 antd 组件 JSON Schema demo 演示项目，包含项目骨架、导航系统、500+ demo JSON 文件

### Modified Capabilities

- 无（纯新增项目，不修改现有能力）

## Impact

**新增文件**：
- `src/packages/antd-demo-playground/` 目录下所有文件
- `openspec/changes/create-antd-demo-playground/` specs 文件

**依赖关系**：
- 依赖 `@json-engine/vue-json`
- 依赖 `@json-engine/plugin-antd`（已扩展 includeIcons 配置）
- 依赖 `@json-engine/plugin-router`
- 依赖 `ant-design-vue`、`vue`

**向后兼容**：
- 完全向后兼容，纯新增项目
