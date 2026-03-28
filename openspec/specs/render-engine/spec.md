# render-engine

运行时渲染函数生成能力，使用 Vue Core API (`h()`) 生成渲染函数。

## ADDED Requirements

### Requirement: Generate render function from VNodeDefinition

系统必须能够从 VNodeDefinition 生成 Vue 渲染函数。

#### Scenario: Render simple element
- **WHEN** render.content 为 `{ type: "div", children: ["Hello"] }`
- **THEN** 系统生成 `h("div", null, "Hello")` 渲染结果

#### Scenario: Render element with props
- **WHEN** render.content 为 `{ type: "div", props: { class: "container" }, children: [...] }`
- **THEN** 系统生成 `h("div", { class: "container" }, [...])` 渲染结果

### Requirement: Support nested VNode structure

系统必须支持嵌套的 VNode 结构，递归渲染子节点。

#### Scenario: Render nested elements
- **WHEN** render.content 为多层嵌套结构
- **THEN** 系统递归调用 `h()` 生成完整 DOM 树

#### Scenario: Render mixed children
- **WHEN** children 包含字符串、VNodeDefinition 和数组的混合
- **THEN** 系统正确处理各种类型的子节点

### Requirement: Support component rendering

系统必须支持渲染已注册的 Vue 组件。

#### Scenario: Render registered component
- **WHEN** render.content 的 type 为已注册的组件名
- **THEN** 系统调用 `h(Component, props, children)` 渲染组件

#### Scenario: Render component with slots
- **WHEN** 组件需要插槽内容
- **THEN** 系统将 children 转换为 slots 对象传递给组件

### Requirement: Support expression evaluation

系统必须支持在渲染上下文中求值表达式。

#### Scenario: Evaluate text expression
- **WHEN** children 包含 `{ type: "text", content: "{{state.message}}" }`
- **THEN** 系统在上下文中求值表达式并渲染结果

#### Scenario: Evaluate props binding
- **WHEN** props 值为 `"{{state.count}}"`
- **THEN** 系统求值表达式并绑定到对应属性

### Requirement: Support dynamic props and events

系统必须支持动态属性绑定和事件监听。

#### Scenario: Bind dynamic props
- **WHEN** props 定义为 `{ ":value": "state.inputValue" }`
- **THEN** 系统创建响应式属性绑定

#### Scenario: Bind event handler
- **WHEN** props 定义为 `{ "@click": "methods.handleClick" }`
- **THEN** 系统绑定事件处理函数

### Requirement: Support render function mode

系统必须支持直接定义渲染函数（而非模板结构）。

#### Scenario: Use render function
- **WHEN** render.type 为 `"function"` 且 content 为函数体字符串
- **THEN** 系统直接使用该函数体作为渲染函数

### Requirement: Provide render context

系统必须在渲染时提供完整的上下文对象。

#### Scenario: Access context in render
- **WHEN** 渲染函数或表达式中访问 `props`, `state`, `computed`, `methods`, `emit`, `slots`, `attrs`
- **THEN** 系统提供正确的上下文引用