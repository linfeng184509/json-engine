## Context

当前 DSL 的核心问题是：所有动态值通过 `{ type: 'xxx', body: '{{...}}' }` 格式编码，函数体使用 `ref_state_xxx.value` 字符串变量名。这导致三层冗余：JSON 体积膨胀、正则解析开销、`.value` 噪音。core-engine 的 types.ts 有 507 行，其中 ~200 行用于处理这些字符串格式的解析。vue-json 的 value-resolver.ts 有 ~460 行，其中 ~120 行是复杂的正则替换逻辑。

## Goals / Non-Goals

**Goals:**
- JSON 体积减少 35-45%
- 消除所有 `{{...}}` / `{{{...}}}` 分隔符
- 函数体中消除 `.value` 噪音（619 处 ref_state_ 模式）
- 统一 scope 引用语法为 `$core.xxx` / `$ui.xxx` 命名空间
- 核心代码净减少 ~280 行
- 编辑器可提供结构化字段的智能提示

**Non-Goals:**
- 不提供向后兼容层（BREAKING change）
- 不改变 state/computed/methods 的声明式结构（只改引用方式）
- 不改变插件系统架构
- 不引入新的运行时依赖

## Decisions

### Decision 1: 4 个 `$` 前缀替代 type/body 格式

**选择**：`$ref`（引用）、`$expr`（表达式）、`$fn`（函数）、`$scope`（服务注入）

**理由**：`$` 前缀在 JSON 中不会与原生键名冲突（JSON 属性名通常不用 `$` 开头），且语义清晰。4 个前缀覆盖了 100% 的动态值场景。

**替代方案**：使用 `_` 前缀（如 `_ref`）。但 `_` 在某些 JSON 编辑器中可能被折叠或忽略，`$` 更醒目。

### Decision 2: State Proxy 自动处理 .value

**选择**：在 state-factory.ts 中创建 Proxy，get 时自动 unwrap `.value`，set 时自动写入 `.value`。

**理由**：函数体中 `$state.count` 直接映射为 `state.count`，Proxy 处理 ref/reactive 差异。这消除了 619 处 `.value` 噪音和复杂的 stateType 判断逻辑。

**替代方案**：保持现有方式，在 transformFunctionBody 中插入 `.value`。但这需要维护 stateType 映射表，且正则复杂度高。

### Decision 3: 函数体中 $state/$props/$computed 直接字符串替换

**选择**：transformFunctionBody 使用简单正则替换 `$state` → `state`，`$props` → `props`，`$computed` → `computed`。

**理由**：有了 State Proxy，不再需要判断 ref vs reactive，不再需要插入 `.value`。替换逻辑从 ~120 行减少到 ~15 行。

### Decision 4: Scope 服务使用命名空间分组

**选择**：`$core.api` / `$core.router` / `$core.storage` / `$ui.antd`

**理由**：避免命名冲突（如 `$api` 可能与用户定义的 state 变量冲突），结构清晰，便于扩展。

### Decision 5: 空 params 完全省略

**选择**：`{ "$fn": "methods.handleClick()" }` 等价于当前 `{ "type": "function", "params": "{{{}}}", "body": "{{methods.handleClick()}}" }`

**理由**：90% 的函数 params 为空。有 params 时使用 `{ "$fn": { "params": ["e"], "body": "..." } }` 格式。

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|---|---|---|
| State Proxy 对嵌套深层属性的性能影响 | 低 | Proxy 只在顶层拦截，嵌套属性访问是原生的 |
| `$state.xxx` 字符串替换可能误匹配（如变量名包含 `$state`） | 低 | 使用 `\b$state\b` 单词边界匹配 |
| 迁移脚本可能遗漏 edge case | 中 | 迁移后运行全部单元测试验证 |
| 新格式学习成本 | 低 | 4 个前缀比 6 种 body 格式更简单 |
