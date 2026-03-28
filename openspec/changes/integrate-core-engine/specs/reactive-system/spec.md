# reactive-system (delta)

响应式状态管理能力 - core-engine 表达式格式变更。

## MODIFIED Requirements

### Requirement: Support ref state

系统必须支持使用 `ref` 创建响应式状态。

#### Scenario: Create ref state
- **WHEN** schema.state 中定义 `{ type: "ref", initial: <value> }`
- **THEN** 系统创建 `ref(<value>)` 并在渲染上下文中提供访问

#### Scenario: Access ref value in expression
- **WHEN** 表达式中使用 `{{ref_state_count}}`
- **THEN** 系统正确解析为 `{ type: 'state', variable: 'count' }` 并访问 `state.count.value`

### Requirement: Support reactive state

系统必须支持使用 `reactive` 创建响应式对象。

#### Scenario: Create reactive state
- **WHEN** schema.state 中定义 `{ type: "reactive", initial: { ... } }`
- **THEN** 系统创建 `reactive({ ... })` 并在渲染上下文中提供直接访问

#### Scenario: Access reactive property in expression
- **WHEN** 表达式中使用 `{{ref_state_user}}`
- **THEN** 系统正确解析并访问 reactive 对象 `state.user`

### Requirement: Support computed properties

系统必须支持使用 `computed` 创建计算属性。

#### Scenario: Create computed with getter only
- **WHEN** schema.computed 中定义 `{ get: "{{ref_state_count}} * 2" }`
- **THEN** 系统创建只读 computed 属性

#### Scenario: Create computed with getter and setter
- **WHEN** schema.computed 中定义 `{ get: "...", set: "..." }`
- **THEN** 系统创建可写的 computed 属性

#### Scenario: Access computed in expression
- **WHEN** 表达式中使用 `{{ref_computed_doubleCount}}`
- **THEN** 系统正确解析并访问 computed 的 `.value` 属性

## REMOVED Requirements

### Requirement: Support legacy state access format

**Reason**: 状态访问表达式统一为 core-engine 格式 `{{ref_state_xxx}}`

**Migration**: 用户需将表达式中的状态引用改为：
- `{{state.count}}` → `{{ref_state_count}}`
- `{{state.user.name}}` → 先定义 `user` state，再用 `{{ref_state_user}}.name`