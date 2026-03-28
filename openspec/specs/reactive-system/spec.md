# reactive-system

响应式状态管理能力，支持 Vue 3 Composition API 的响应式系统。

## ADDED Requirements

### Requirement: Support ref state

系统必须支持使用 `ref` 创建响应式状态。

#### Scenario: Create ref state
- **WHEN** schema.state 中定义 `{ type: "ref", initial: <value> }`
- **THEN** 系统创建 `ref(<value>)` 并在渲染上下文中提供访问

#### Scenario: Access ref value in expression
- **WHEN** 表达式中使用 `state.count.value`
- **THEN** 系统正确访问 ref 的 `.value` 属性

### Requirement: Support reactive state

系统必须支持使用 `reactive` 创建响应式对象。

#### Scenario: Create reactive state
- **WHEN** schema.state 中定义 `{ type: "reactive", initial: { ... } }`
- **THEN** 系统创建 `reactive({ ... })` 并在渲染上下文中提供直接访问

#### Scenario: Access reactive property in expression
- **WHEN** 表达式中使用 `state.user.name`
- **THEN** 系统正确访问 reactive 对象的属性

### Requirement: Support computed properties

系统必须支持使用 `computed` 创建计算属性。

#### Scenario: Create computed with getter only
- **WHEN** schema.computed 中定义 `{ get: "<expression>" }`
- **THEN** 系统创建只读 computed 属性

#### Scenario: Create computed with getter and setter
- **WHEN** schema.computed 中定义 `{ get: "<expression>", set: "<expression>" }`
- **THEN** 系统创建可写的 computed 属性

#### Scenario: Access computed in expression
- **WHEN** 表达式中使用 `computed.doubleCount.value`
- **THEN** 系统正确访问 computed 的 `.value` 属性

### Requirement: Support watch and watchEffect

系统必须支持使用 `watch` 和 `watchEffect` 创建侦听器。

#### Scenario: Create watch for ref
- **WHEN** schema.watch 中定义 `{ source: "state.count", handler: "<function>" }`
- **THEN** 系统创建 `watch(() => state.count.value, handler)` 侦听器

#### Scenario: Create watch with options
- **WHEN** schema.watch 中定义 `{ immediate: true, deep: true }`
- **THEN** 系统创建带有这些选项的 watch

#### Scenario: Create watchEffect
- **WHEN** schema.watch 中定义 `{ type: "effect", handler: "<function>" }`
- **THEN** 系统创建 `watchEffect(handler)`

### Requirement: Support provide/inject

系统必须支持使用 `provide` 和 `inject` 实现依赖注入。

#### Scenario: Provide value
- **WHEN** schema.provide 中定义 `{ key: "theme", value: "<expression>" }`
- **THEN** 系统调用 `provide("theme", evaluatedValue)`

#### Scenario: Inject value
- **WHEN** schema.inject 中定义 `{ key: "theme", default: "<value>" }`
- **THEN** 系统调用 `inject("theme", defaultValue)` 并在上下文中提供访问

### Requirement: Support reactive transformations

系统必须支持 `toRef`, `toRefs`, `readonly` 等响应式转换工具。

#### Scenario: Create toRef
- **WHEN** schema.state 中定义 `{ type: "toRef", source: "props", key: "value" }`
- **THEN** 系统创建 `toRef(props, "value")`

#### Scenario: Create readonly
- **WHEN** schema.state 中定义 `{ type: "readonly", source: "state.config" }`
- **THEN** 系统创建 `readonly(state.config)`

### Requirement: Support shallow reactive variants

系统必须支持 `shallowRef` 和 `shallowReactive`。

#### Scenario: Create shallowRef
- **WHEN** schema.state 中定义 `{ type: "shallowRef", initial: <value> }`
- **THEN** 系统创建 `shallowRef(<value>)`

#### Scenario: Create shallowReactive
- **WHEN** schema.state 中定义 `{ type: "shallowReactive", initial: { ... } }`
- **THEN** 系统创建 `shallowReactive({ ... })`