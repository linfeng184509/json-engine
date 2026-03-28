# render-engine (delta)

运行时渲染函数生成能力 - core-engine 表达式格式变更。

## MODIFIED Requirements

### Requirement: Support expression evaluation

系统必须支持在渲染上下文中求值 core-engine 格式表达式。

#### Scenario: Evaluate state reference
- **WHEN** children 包含 `{{ref_state_message}}`
- **THEN** 系统使用 parseNestedReference 解析并访问 `state.message.value`

#### Scenario: Evaluate props reference
- **WHEN** props 值为 `{{ref_props_title}}`
- **THEN** 系统使用 parseNestedReference 解析并访问 `props.title`

#### Scenario: Evaluate nested reference
- **WHEN** 表达式为 `{{ref_state_user}}.name`
- **THEN** 系统先解析引用获取 user 对象，再访问 `.name` 属性

#### Scenario: Evaluate mixed expression
- **WHEN** 表达式为 `{{ref_state_count}} + 1`
- **THEN** 系统解析引用后执行加法运算

### Requirement: Support dynamic props and events

系统必须支持动态属性绑定，使用 core-engine 格式表达式。

#### Scenario: Bind dynamic props
- **WHEN** props 定义为 `{ ":value": "{{ref_state_inputValue}}" }`
- **THEN** 系统创建响应式属性绑定

#### Scenario: Bind event handler
- **WHEN** props 定义为 `{ "@click": "methods.handleClick" }`
- **THEN** 系统绑定事件处理函数

## REMOVED Requirements

### Requirement: Support legacy render expression format

**Reason**: 渲染表达式统一为 core-engine 格式

**Migration**: 用户需将渲染中的表达式改为：
- `{{state.message}}` → `{{ref_state_message}}`
- `{{props.title}}` → `{{ref_props_title}}`
- `props: { value: "state.input" }` → `props: { value: "{{ref_state_input}}" }`