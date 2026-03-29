# reactive-system (delta)

响应式状态管理能力 - 使用结构化引用类型。

## MODIFIED Requirements

### Requirement: Support ref state with structured initial value

系统必须支持使用结构化类型作为 ref 初始值。

#### Scenario: Create ref with ExpressionValue initial
- **WHEN** schema.state.count.initial 为 `{ type: 'expression', body: '{{ref_props_initialCount}}' }`
- **THEN** 系统求值表达式并设置为初始值

#### Scenario: Create ref with PropsRef initial
- **WHEN** schema.state.count.initial 为 `{ type: 'props', variable: 'initialCount' }`
- **THEN** 系统使用 props.initialCount 作为初始值

### Requirement: Support reactive state with structured initial

系统必须支持使用结构化类型作为 reactive 初始值。

#### Scenario: Create reactive with ExpressionValue initial
- **WHEN** schema.state.user.initial 为 `{ type: 'expression', body: '{{ref_props_defaultUser}}' }`
- **THEN** 系统求值表达式并设置为初始值

### Requirement: Support computed with FunctionValue

系统必须支持使用 FunctionValue 定义 computed。

#### Scenario: Create computed with FunctionValue getter
- **WHEN** schema.computed.doubled.get 为 `{ type: 'function', params: '', body: 'return state.count.value * 2' }`
- **THEN** 系统创建只读 computed 属性

#### Scenario: Create computed with FunctionValue getter and setter
- **WHEN** computed.get 和 computed.set 都是 FunctionValue
- **THEN** 系统创建可写 computed 属性

### Requirement: Access state via StateRef

系统必须支持通过 StateRef 访问状态。

#### Scenario: Read state via StateRef
- **WHEN** 运行时遇到 `{ type: 'state', variable: 'count' }`
- **THEN** 系统返回 `context.state.count.value`

#### Scenario: Write state via StateRef in vModel
- **WHEN** vModel.prop 为 `{ type: 'state', variable: 'inputValue' }`
- **THEN** input 事件更新 `context.state.inputValue.value`

### Requirement: Access props via PropsRef

系统必须支持通过 PropsRef 访问属性。

#### Scenario: Read props via PropsRef
- **WHEN** 运行时遇到 `{ type: 'props', variable: 'title' }`
- **THEN** 系统返回 `context.props.title`

## REMOVED Requirements

### Requirement: Support legacy state access format

**Reason**: 完全迁移到结构化引用类型

**Migration**: 
- `state.count.value` 在表达式中 → 使用 ExpressionValue 包装
- `props.title` 在表达式中 → 使用 PropsRef 或 ExpressionValue