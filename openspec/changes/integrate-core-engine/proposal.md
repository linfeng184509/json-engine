## Why

vue-json 当前声明依赖 `@json-engine/core-engine` 但未实际使用其解析能力。规格文档明确要求必须集成 `parseJson` 预处理 JSON Schema，使用 `parseNestedReference` 解析嵌套引用，并通过 `registerKeyParser` 支持 key 映射。

这是架构设计的基础要求，确保 vue-json 与 core-engine 形成统一的 JSON 解析体系。

## What Changes

- **BREAKING**: 表达式格式从 `{{count}}` 统一迁移到 core-engine 格式 `{{ref_state_count}}`
- 集成 `parseJson` 函数预处理所有 JSON Schema 输入
- 使用 `parseNestedReference` 解析 scope/props/state 引用
- 新增 KeyParser 注册机制支持组件名和状态键名转换
- 移除 vue-json 自有的重复解析逻辑，统一使用 core-engine 提供的能力

## Capabilities

### New Capabilities

- `core-engine-integration`: core-engine 的 parseJson、ValueParser 系列、KeyParser 机制集成到 vue-json parser 系统

### Modified Capabilities

- `json-schema-parser`: 修改为必须调用 parseJson 预处理，使用 parseNestedReference 解析引用
- `reactive-system`: 表达式格式统一为 `{{ref_state_xxx}}` 和 `{{ref_props_xxx}}`
- `directive-runtime`: 表达式评估改用 core-engine 的 parseNestedReference
- `render-engine`: VNode 渲染中的表达式引用格式适配

## Impact

**受影响文件：**
- `src/parser/index.ts` - 导入 parseJson，预处理 JSON Schema
- `src/utils/expression.ts` - 集成 parseNestedReference
- `src/parser/key-parsers.ts` (新增) - KeyParser 定义
- `src/runtime/directive-runtime.ts` - 表达式解析适配
- `src/runtime/state-factory.ts` - 状态引用格式支持
- `src/runtime/render-factory.ts` - 渲染表达式适配
- `__tests__/*.test.ts` - 测试用例迁移到 core-engine 格式

**API 影响：**
- 用户提供的 JSON Schema 必须使用 `{{ref_state_xxx}}` 格式而非 `{{xxx}}`
- 新增 KeyParser API 允许自定义 key 映射