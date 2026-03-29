# structured-schema-types

基于 core-engine 的结构化 Schema 类型定义。

## ADDED Requirements

### Requirement: Define ExpressionValue type

系统必须定义与 core-engine 兼容的 ExpressionValue 类型。

#### Scenario: ExpressionValue structure
- **WHEN** 定义 ExpressionValue 类型
- **THEN** 类型包含 `type: 'expression'` 和 `body: string` 字段

#### Scenario: ExpressionValue body format
- **WHEN** ExpressionValue.body 包含 `{{ref_state_xxx}}` 格式
- **THEN** 系统使用 parseNestedReference 解析引用

### Requirement: Define FunctionValue type

系统必须定义与 core-engine 兼容的 FunctionValue 类型。

#### Scenario: FunctionValue structure
- **WHEN** 定义 FunctionValue 类型
- **THEN** 类型包含 `type: 'function'`、`params: string` 和 `body: string` 字段

#### Scenario: FunctionValue with empty params
- **WHEN** FunctionValue.params 为空字符串
- **THEN** 系统接受该函数定义

### Requirement: Define StateRef and PropsRef types

系统必须定义结构化的状态和属性引用类型。

#### Scenario: StateRef structure
- **WHEN** 定义 StateRef 类型
- **THEN** 类型包含 `type: 'state'` 和 `variable: string` 字段

#### Scenario: PropsRef structure
- **WHEN** 定义 PropsRef 类型
- **THEN** 类型包含 `type: 'props'` 和 `variable: string` 字段

### Requirement: Define PropertyValue union type

系统必须定义 PropertyValue 联合类型，表示所有可能的属性值。

#### Scenario: PropertyValue includes literals
- **WHEN** 定义 PropertyValue 类型
- **THEN** 类型包含 string、number、boolean、null 字面量

#### Scenario: PropertyValue includes structured types
- **WHEN** 定义 PropertyValue 类型
- **THEN** 类型包含 ExpressionValue、StateRef、PropsRef

### Requirement: Define VNodeDefinition with structured types

系统必须定义使用结构化类型的 VNodeDefinition。

#### Scenario: VNode props use PropertyValue
- **WHEN** 定义 VNodeDefinition.props
- **THEN** 属性值类型为 PropertyValue

#### Scenario: VNode children use structured types
- **WHEN** 定义 VNodeDefinition.children
- **THEN** 子节点可以是 ExpressionValue 或 VNodeDefinition

#### Scenario: vIf directive uses ExpressionValue
- **WHEN** 定义 VNodeDirectives.vIf
- **THEN** 类型为 ExpressionValue

#### Scenario: vOn directive uses FunctionValue
- **WHEN** 定义 VNodeDirectives.vOn
- **THEN** 事件处理器类型为 Record<string, FunctionValue>

#### Scenario: vModel prop requires reference
- **WHEN** 定义 VNodeDirectives.vModel.prop
- **THEN** 类型必须为 StateRef 或 PropsRef

### Requirement: Define Schema types with structured values

系统必须定义使用结构化值的完整 Schema 类型。

#### Scenario: MethodsDefinition uses FunctionValue
- **WHEN** 定义 MethodsDefinition
- **THEN** 每个方法值类型为 FunctionValue

#### Scenario: ComputedDefinition uses FunctionValue
- **WHEN** 定义 ComputedDefinition.get/set
- **THEN** getter/setter 类型为 FunctionValue

#### Scenario: LifecycleDefinition uses FunctionValue
- **WHEN** 定义 LifecycleDefinition
- **THEN** 每个 hook 值类型为 FunctionValue 或 FunctionValue[]

#### Scenario: StateDefinition initial uses PropertyValue
- **WHEN** 定义 StateDefinition.initial
- **THEN** 初始值类型为 PropertyValue