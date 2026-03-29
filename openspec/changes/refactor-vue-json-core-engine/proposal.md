## Why

vue-json 当前未完全使用 core-engine 的解析能力：
1. **表达式**：使用直接字符串而非 `{ type: 'expression', body: '...' }` 结构
2. **函数**：使用直接函数体字符串而非 `{ type: 'function', params: '', body: '...' }` 结构
3. **引用**：未使用 core-engine 的 `{ type: 'state' | 'props', variable: '...' }` 结构化引用
4. **parseJson**：未在 Schema 解析入口使用 core-engine 的 `parseJson` 预处理

这违反了架构设计要求：vue-json 必须完全基于 core-engine 构建，形成统一的 JSON 解析体系。

## What Changes

- **BREAKING**: 完全重构 Schema 格式，使用 core-engine 结构化类型
- **BREAKING**: 表达式改为 `{ type: 'expression', body: '{{ref_state_xxx}}' }` 格式
- **BREAKING**: 函数改为 `{ type: 'function', params: '', body: '...' }` 格式
- **BREAKING**: 引用改为 `{ type: 'state' | 'props', variable: 'xxx' }` 格式
- 在 `parseSchema` 入口使用 `parseJson` 预处理整个 Schema
- 重写类型定义 `types/schema.ts` 以匹配 core-engine 结构
- 重写所有 parser 使用解析后的结构化数据
- 更新 runtime 层处理新的值类型
- 重写所有测试用例和示例文件

## Capabilities

### New Capabilities

- `structured-schema-types`: 基于 core-engine 的结构化 Schema 类型定义，包括 ExpressionValue, FunctionValue, StateRef, PropsRef 等
- `parsejson-integration`: parseSchema 入口完全集成 parseJson，自动解析所有结构化值类型

### Modified Capabilities

- `json-schema-parser`: 使用 parseJson 预处理，Schema 结构完全重构
- `reactive-system`: state/props 引用使用结构化类型
- `directive-runtime`: 表达式和函数使用结构化值
- `render-engine`: VNode 属性和子节点使用结构化值
- `type-generator`: 类型生成适配新 Schema 格式

## Impact

**受影响文件（全部重写）：**

| 模块 | 文件 | 变更程度 |
|------|------|----------|
| Types | `types/schema.ts` | 完全重写 |
| Types | `types/runtime.ts` | 更新 RenderContext |
| Parser | `parser/index.ts` | 重写使用 parseJson |
| Parser | `parser/*.ts` (所有) | 重写验证逻辑 |
| Runtime | `runtime/component-factory.ts` | 更新处理结构化值 |
| Runtime | `runtime/state-factory.ts` | 更新初始值处理 |
| Runtime | `runtime/computed-factory.ts` | 更新函数值处理 |
| Runtime | `runtime/lifecycle-factory.ts` | 更新函数值处理 |
| Runtime | `runtime/directive-runtime.ts` | 更新表达式/函数处理 |
| Runtime | `runtime/render-factory.ts` | 更新 VNode 处理 |
| Utils | `utils/expression.ts` | 简化，使用解析后数据 |
| Tests | `__tests__/**/*.ts` | 全部重写 |
| Examples | `examples/*.json` | 全部重写 |
| Docs | `README.md` | 重写文档 |