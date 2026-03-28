# type-generator

TypeScript 类型定义生成能力，从 JSON Schema 自动生成类型。

## ADDED Requirements

### Requirement: Generate component props types

系统必须能够从 schema.props 生成 TypeScript 类型定义。

#### Scenario: Generate props interface
- **WHEN** schema.props 定义了多个属性
- **THEN** 系统生成对应的 Props 接口类型

#### Scenario: Handle optional props
- **WHEN** prop 的 required 为 false 或有 default 值
- **THEN** 系统将该属性标记为可选（`?`）

#### Scenario: Handle prop types
- **WHEN** prop 定义 type 为 "String"
- **THEN** 系统生成 `string` 类型

### Requirement: Generate state types

系统必须能够从 schema.state 生成状态类型定义。

#### Scenario: Generate state interface
- **WHEN** schema.state 定义了多个状态
- **THEN** 系统生成对应的 State 接口类型

#### Scenario: Infer state types from initial values
- **WHEN** state 的 initial 为具体值
- **THEN** 系统推断该值的类型作为状态类型

### Requirement: Generate computed types

系统必须能够从 schema.computed 生成计算属性类型定义。

#### Scenario: Generate computed interface
- **WHEN** schema.computed 定义了计算属性
- **THEN** 系统生成对应的 Computed 接口类型

#### Scenario: Infer computed return type
- **WHEN** computed 的 get 函数有明确的返回值
- **THEN** 系统推断返回类型

### Requirement: Generate methods types

系统必须能够从 schema.methods 生成方法类型定义。

#### Scenario: Generate methods interface
- **WHEN** schema.methods 定义了多个方法
- **THEN** 系统生成对应的 Methods 接口类型

### Requirement: Generate complete component type

系统必须能够生成完整的组件类型定义。

#### Scenario: Generate component type
- **WHEN** 调用 `generateTypes(schema)`
- **THEN** 系统生成包含 props, state, computed, methods 的完整类型

#### Scenario: Output to .d.ts file
- **WHEN** 配置输出文件路径
- **THEN** 系统将类型定义写入 .d.ts 文件

### Requirement: Support type imports

系统必须支持在生成的类型中导入外部类型。

#### Scenario: Import external types
- **WHEN** schema 中引用了外部组件或类型
- **THEN** 系统在类型文件顶部添加 import 语句

### Requirement: Generate type guards

系统必须支持生成类型守卫函数。

#### Scenario: Generate props type guard
- **WHEN** 配置 generateTypeGuards: true
- **THEN** 系统生成 `isProps(obj): obj is Props` 类型守卫函数

### Requirement: Support generic components

系统必须支持泛型组件类型生成。

#### Scenario: Generate generic props type
- **WHEN** schema.props 定义泛型参数
- **THEN** 系统生成泛型接口 `Props<T>`

### Requirement: Provide type inference helpers

系统必须提供类型推断辅助函数。

#### Scenario: Infer type from schema
- **WHEN** 调用 `inferSchemaType(schema)`
- **THEN** 系统返回对应的 TypeScript 类型对象