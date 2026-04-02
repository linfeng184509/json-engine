## Why

当前 DSL 使用 `{{...}}` / `{{{...}}}` 分隔符包裹所有动态值，函数体中使用 `ref_state_xxx.value` 字符串变量名依赖正则替换。这导致：
- JSON 体积膨胀 35-45%
- 编辑器无法提供智能提示
- 运行时需 20+ 个复杂正则匹配
- `.value` 噪音遍布所有函数体（619 处 `ref_state_` 模式）
- scope 引用语法不统一（`$_core_xxx` vs `$[core]_xxx`）

## What Changes

- **输入格式**：用 4 个 `$` 前缀（`$ref`/`$expr`/`$fn`/`$scope`）替代 `{ type: 'xxx', body: '{{...}}' }` 格式
- **函数体 API**：用 `$state.count` / `$props.title` / `$computed.label` 替代 `ref_state_count.value` / `ref_props_title` / `ref_computed_label`
- **Scope 服务**：统一为 `$core.api` / `$core.router` / `$core.storage` / `$ui.antd` 命名空间分组
- **空 params 省略**：90% 的函数 params 为空，直接省略 `params` 字段
- **State Proxy**：引入自动 unwrap/wrap 的 Proxy 层，消除函数体中的 `.value` 噪音
- **移除分隔符**：消除所有 `{{...}}` / `{{{...}}}` 包裹，原生值直接使用
- **BREAKING**：所有现有 JSON schema 需要迁移到新格式（不提供兼容层）

## Capabilities

### New Capabilities
- `dsl-input-format`: 结构化 DSL 输入格式，支持 $ref/$expr/$fn/$scope 四种值类型前缀
- `context-api`: 函数体上下文对象 API（$state/$props/$computed/$core.* / $ui.*），替代 ref_xxx 字符串变量名
- `state-proxy`: State Proxy 层，自动处理 ref/reactive 的 .value unwrap/wrap

### Modified Capabilities
- `json-schema-parser`: 输入格式从 body 字符串改为结构化 $ 前缀，移除 ValueConstraintParser/ValueObjectParser，简化 FunctionParser
- `directive-runtime`: vModel prop 字段识别 $ref 格式，vOn 识别 $fn 格式
- `reactive-system`: 引入 State Proxy，表达式中不再需要 .value 后缀
- `render-engine`: 表达式求值简化，不再需要 parseNestedReference 和复杂正则替换

## Impact

- `core-engine/types.ts`: 移除 ~150 行（ValueConstraintParser/ValueObjectParser/复杂正则）
- `core-engine/parseJson.ts`: 增加 normalizeValue 前置转换，简化 dispatch 逻辑
- `core-engine/regex-factory.ts`: 完全移除（不再需要动态生成 ref/scope 正则）
- `vue-json/value-resolver.ts`: 重构 transformFunctionBody/evaluateStringExpression，减少 ~60 行
- `vue-json/state-factory.ts`: 增加 State Proxy 层
- `vue-json/directive-runtime.ts`: 简化 vModel/vOn 处理
- `vue-json/config/vue-parser-config.ts`: 移除 stateValueParser/propsValueParser fallback hack
- 所有 JSON schema 文件（~150 个）：需要迁移脚本自动转换
- 单元测试：全部需要更新以匹配新格式
