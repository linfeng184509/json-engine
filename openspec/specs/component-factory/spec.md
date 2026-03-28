# component-factory

组件工厂能力，支持创建和管理 Vue 组件。

## ADDED Requirements

### Requirement: Create Vue component from schema

系统必须能够从 VueJsonSchema 创建 Vue 组件。

#### Scenario: Create basic component
- **WHEN** 调用 `createComponent(schema)` 传入有效的 schema
- **THEN** 系统返回 Vue Component 对象

#### Scenario: Component has correct name
- **WHEN** schema.name 为 "MyComponent"
- **THEN** 创建的组件 name 属性为 "MyComponent"

### Requirement: Support local component registration

系统必须支持注册本地组件。

#### Scenario: Register local component
- **WHEN** schema.components 定义 `{ ChildComp: { type: "local", source: "ChildComponent" } }`
- **THEN** 系统在组件内部注册 ChildComp

#### Scenario: Use registered component in render
- **WHEN** render 中使用已注册的组件名
- **THEN** 系统正确渲染该组件

### Requirement: Support async component loading

系统必须支持异步组件加载。

#### Scenario: Load async component
- **WHEN** schema.components 定义 `{ AsyncComp: { type: "async", source: "() => import('./AsyncComp.vue')" } }`
- **THEN** 系统使用 `defineAsyncComponent` 加载组件

#### Scenario: Show loading component
- **WHEN** 异步组件定义了 loadingComponent
- **THEN** 加载期间显示 loadingComponent

#### Scenario: Show error component
- **WHEN** 异步组件加载失败且定义了 errorComponent
- **THEN** 显示 errorComponent

#### Scenario: Configure delay and timeout
- **WHEN** 异步组件定义了 delay 和 timeout
- **THEN** 系统使用这些配置加载组件

### Requirement: Support props definition

系统必须支持定义组件 props。

#### Scenario: Define props with types
- **WHEN** schema.props 定义类型的 prop
- **THEN** 系统生成正确的 props 选项

#### Scenario: Define required props
- **WHEN** schema.props 定义 required: true
- **THEN** 系统验证 prop 是否传入

#### Scenario: Define default values
- **WHEN** schema.props 定义 default 值
- **THEN** 系统在 prop 未传入时使用默认值

#### Scenario: Define validator
- **WHEN** schema.props 定义 validator 函数体
- **THEN** 系统使用该验证器验证 prop 值

### Requirement: Support emits definition

系统必须支持定义组件 emits。

#### Scenario: Define emits
- **WHEN** schema.emits 定义事件名数组
- **THEN** 系统生成正确的 emits 选项

#### Scenario: Validate emit payload
- **WHEN** schema.emits 定义验证函数
- **THEN** 系统在 emit 时验证 payload

### Requirement: Provide emit function

系统必须在上下文中提供 emit 函数。

#### Scenario: Emit custom event
- **WHEN** methods 中调用 `emit("update", value)`
- **THEN** 系统触发自定义事件，传递 value

### Requirement: Support component caching

系统必须支持组件缓存，避免重复解析。

#### Scenario: Cache parsed component
- **WHEN** 多次使用相同的 schema 调用 createComponent
- **THEN** 系统返回缓存的组件实例

#### Scenario: Clear component cache
- **WHEN** 调用 `clearComponentCache()`
- **THEN** 系统清除所有缓存的组件