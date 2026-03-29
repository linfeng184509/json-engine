## Why

当前 core-engine 存在框架特定的概念耦合（如 `props`、`state`、`scope` 等命名暗示 Vue 语义），且使用全局注册机制管理 KeyParser，缺乏插件化能力。这限制了 core-engine 作为通用 JSON 解析引擎的潜力，也阻碍了其他框架（如 React、Svelte）适配层的发展。

## What Changes

- **重构 core-engine 类型系统**：移除框架特定语义，使用抽象类型（Reference、Expression、Scope）替代
- **实现插件化 Parser 架构**：支持自定义 ValueParser 和 KeyParser，通过 config 对象注入而非全局注册
- **动态正则表达式工厂**：支持自定义引用前缀（ref_）和 scope 名称
- **统一类型标记输出**：parseJson 输出包含 `_type` 字段，便于运行时识别
- **多框架适配层架构**：定义 vue-json 和未来 react-json 的标准适配接口
- **移除全局状态**：所有配置通过函数参数传递，避免副作用

## Capabilities

### New Capabilities

- `plugin-parser-architecture`: core-engine 插件化解析架构，支持自定义 ValueParser/KeyParser 注册
- `abstract-type-system`: 抽象类型系统，移除 Vue/React 等框架特定语义
- `dynamic-reference-prefix`: 动态引用前缀配置，支持任意框架的引用格式
- `framework-adapter-interface`: 多框架适配层标准接口

### Modified Capabilities

- `json-schema-parser`: 解析器配置从全局注册改为 config 参数注入，支持自定义前缀和 scope
- `reactive-system`: 状态引用类型从框架特定改为抽象 Reference 类型

## Impact

**受影响模块：**

| 模块 | 变更 |
|------|------|
| core-engine/types.ts | 重构类型定义，移除 `props`/`state` 语义 |
| core-engine/parseJson.ts | 移除全局 registry，改用 ParserConfig |
| core-engine 新增 | regex-factory.ts, config-factory.ts |
| vue-json/parser | 适配新的 config 机制 |
| vue-json/types | 重新导出抽象类型，定义 Vue 特定扩展 |
| 新增 | react-json 包（预留接口） |
