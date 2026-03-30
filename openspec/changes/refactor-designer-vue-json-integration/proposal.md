## Why

designer 包存在严重的架构问题：

1. **错误的包依赖**: 使用不存在的 `@json-vue/core`、`@json-vue/plugin-antd`、`@json-vue/schema` 等包
2. **错误的类型引用**: 导入不存在的 `VNodeDef`、`JsonVueComponentDef` 类型
3. **非标准 Schema 格式**: 输出的 `{name, render, state?}` 不符合 `VueJsonSchema` 规范
4. **手动 VNode 构建**: 使用 `h()` + `resolveComponent()` 而非 `createComponent()`
5. **错误的表达式语法**: 函数使用 `{ type: "function", params: ["event"], expression: value }` 而非 core-engine 规范

这导致 designer 无法与 vue-json 生态系统正确集成，也无法利用 core-engine 的解析能力。

## What Changes

- **FIX**: 修复所有错误的包依赖，使用 `@json-engine/vue-json` 和 `@json-engine/plugin-antd`
- **REFACTOR**: `schemaGenerator.ts` 输出标准 `VueJsonSchema` 格式
- **REFACTOR**: `FormPreview.vue` 使用 `createComponent()` 渲染预览
- **REFACTOR**: 表达式和函数使用 core-engine 规范格式 `{{{params}}}{{body}}`
- **FIX**: AI 工具的 validateSchema 导入修复

## Capabilities

### New Capabilities

- `vue-json-integration`: designer 完全集成 vue-json，使用标准 Schema 格式和 createComponent 渲染
- `core-engine-compliance`: 所有表达式/函数符合 core-engine 规范

### Modified Capabilities

- `schema-generator`: 输出标准 VueJsonSchema 而非自定义格式
- `form-preview`: 使用 vue-json createComponent 而非手动 h()
- `json-preview`: 显示标准 Schema 格式

## Impact

**受影响文件：**

| 模块 | 文件 | 变更程度 |
|------|------|----------|
| Config | `package.json` | 依赖修复 |
| Utils | `src/utils/schemaGenerator.ts` | 完全重构 |
| Components | `src/components/FormPreview.vue` | 重构渲染逻辑 |
| Components | `src/components/JsonPreview.vue` | 格式更新 |
| AI | `src/ai/tools.ts` | 导入修复 |
| Types | `src/types.ts` | 类型映射调整 |
