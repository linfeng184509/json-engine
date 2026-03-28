## Context

**当前状态：**
- vue-json 声明依赖 `@json-engine/core-engine` 但未实际使用
- vue-json 自建了一套表达式解析系统（`{{count}}` 格式）
- core-engine 提供 `parseJson`、`parseNestedReference`、`registerKeyParser` 等能力
- 规格文档明确要求集成 core-engine

**核心差异：**
| 功能 | core-engine 格式 | vue-json 当前格式 |
|------|------------------|-------------------|
| State 引用 | `{{ref_state_count}}` | `{{count}}` 或 `state.count.value` |
| Props 引用 | `{{ref_props_title}}` | `props.title` |
| Scope 引用 | `{{$_[core|goal]_var}}` | 无 |
| Expression | `{{expression_body}}` | `{{expression_body}}` |

## Goals / Non-Goals

**Goals：**
- vue-json parser 必须调用 `parseJson` 预处理所有 Schema 输入
- 表达式评估使用 `parseNestedReference` 解析引用
- 提供 KeyParser API 供用户自定义 key 映射
- 统一表达式格式为 core-engine 规范

**Non-Goals：**
- 不支持双格式兼容（仅 core-engine 格式）
- 不修改 core-engine 本身
- 不影响 core-engine 其他消费者

## Decisions

### Decision 1: parseNestedReference 在表达式评估中使用

**选择：** 在 `evaluateExpression` 中使用 `parseNestedReference` 解析引用表达式

**理由：**
- core-engine 的 `parseJson` 会解析整个 Schema，与 vue-json 的结构冲突（如 `render: { type: 'function' }` 会被误解析）
- 直接在表达式评估时使用 `parseNestedReference` 更精确，只处理引用格式
- 保持 Schema 解析逻辑不变，降低风险

**实际实现：**
- `evaluateExpression` 检测 `ref_state_xxx`、`ref_props_xxx`、`ref_computed_xxx` 格式
- 使用 `parseNestedReference` 解析引用
- 对于混合表达式（如 `ref_state_count + 1`），转换引用后求值

### Decision 2: 表达式评估集成 parseNestedReference

**选择：** 在 `evaluateExpression` 中优先使用 `parseNestedReference`

**理由：**
- 保持核心评估逻辑不变
- 对于非引用表达式（如 `{{a + b}}`），走原有路径
- 对于引用表达式（如 `{{ref_state_count}}`），使用 core-engine 解析

**代码位置：** `src/utils/expression.ts`

```ts
import { parseNestedReference } from '@json-engine/core-engine';

function resolveReference(expression: string, context: RenderContext) {
  const parsed = parseNestedReference(expression);
  
  if (typeof parsed === 'string') {
    // 非 core-engine 格式，保持原有逻辑
    return null;
  }
  
  switch (parsed.type) {
    case 'state':
      return context.state[parsed.variable]?.value;
    case 'props':
      return context.props[parsed.variable];
    case 'scope':
      // scope 处理逻辑
      return context[parsed.scope]?.[parsed.variable];
  }
}
```

### Decision 3: KeyParser 注册机制

**选择：** 新增 `src/parser/key-parsers.ts` 提供默认 KeyParser

**理由：**
- 规格要求支持 KeyParser 映射
- 默认 KeyParser 处理组件名、状态键名验证
- 用户可通过 `registerKeyParser` 自定义

**默认 KeyParser：**
- `component-name`: kebab-case → PascalCase 转换
- `state-key`: 验证变量名合法性

### Decision 4: 表达式格式迁移策略

**选择：** 仅支持 core-engine 格式，移除原有格式支持

**理由：**
- 简化实现，避免双格式解析复杂度
- 符合用户确认的需求
- 迁移路径清晰：用户需更新 Schema 格式

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 现有 Schema 不兼容 | 提供迁移指南，文档说明格式变更 |
| parseJson 解析失败 | 保持错误上下文，提供清晰错误信息 |
| KeyParser 冲突 | 支持 unregisterKeyParser，提供默认值覆盖 |
| 性能影响 parseJson 预处理 | core-engine 已优化，表达式缓存机制保持 |