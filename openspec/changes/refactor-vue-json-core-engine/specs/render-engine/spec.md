# render-engine (delta)

运行时渲染函数生成能力 - 使用结构化值类型。

## MODIFIED Requirements

### Requirement: Resolve PropertyValue in VNode props

系统必须正确解析 VNode 属性中的 PropertyValue。

#### Scenario: Resolve literal prop
- **WHEN** prop 值为字面量（string、number、boolean、null）
- **THEN** 直接使用该值

#### Scenario: Resolve ExpressionValue prop
- **WHEN** prop 值为 `{ type: 'expression', body: '{{ref_state_count}}' }`
- **THEN** 求值表达式并使用结果

#### Scenario: Resolve StateRef prop
- **WHEN** prop 值为 `{ type: 'state', variable: 'count' }`
- **THEN** 返回 `context.state.count.value`

#### Scenario: Resolve PropsRef prop
- **WHEN** prop 值为 `{ type: 'props', variable: 'title' }`
- **THEN** 返回 `context.props.title`

### Requirement: Resolve VNode children with structured types

系统必须正确解析 VNode 子节点中的结构化类型。

#### Scenario: Resolve ExpressionValue child
- **WHEN** children 包含 `{ type: 'expression', body: '{{ref_state_message}}' }`
- **THEN** 求值表达式并渲染结果

#### Scenario: Resolve nested VNodeDefinition child
- **WHEN** children 包含嵌套的 VNodeDefinition
- **THEN** 递归渲染子节点

#### Scenario: Resolve mixed children array
- **WHEN** children 为 `[string, ExpressionValue, VNodeDefinition]`
- **THEN** 正确解析每个元素并渲染

### Requirement: Generate render function from structured Schema

系统必须从结构化 Schema 生成 Vue 渲染函数。

#### Scenario: Generate from template with ExpressionValue props
- **WHEN** render.content.props 包含 ExpressionValue
- **THEN** 生成的渲染函数在执行时求值表达式

#### Scenario: Generate from template with FunctionValue directives
- **WHEN** render.content.directives.vOn 包含 FunctionValue
- **THEN** 生成的渲染函数绑定事件处理器

### Requirement: Support render function mode with FunctionValue

系统必须支持 FunctionValue 格式的 render 函数。

#### Scenario: Use FunctionValue as render content
- **WHEN** render.type 为 'function' 且 content 为 FunctionValue
- **THEN** 系统使用 FunctionValue.body 作为渲染函数体

## REMOVED Requirements

### Requirement: Support legacy string expression in render

**Reason**: 完全迁移到结构化值类型

**Migration**:
- `children: "{{ref_state_message}}"` → `children: { type: 'expression', body: '{{ref_state_message}}' }`
- `props: { value: "ref_state_input" }` → `props: { value: { type: 'state', variable: 'input' } }`