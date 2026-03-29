# framework-adapter-interface

多框架适配层标准接口定义，支持 Vue、React、Svelte 等框架。

## ADDED Requirements

### Requirement: FrameworkAdapter interface

系统必须定义 FrameworkAdapter 接口描述框架适配层。

#### Scenario: Adapter has name property
- **WHEN** 实现 FrameworkAdapter
- **THEN** adapter.name 返回框架标识字符串

#### Scenario: Adapter has config property
- **WHEN** 实现 FrameworkAdapter
- **THEN** adapter.config 返回该框架的 ParserConfig

#### Scenario: Adapter has runtime property
- **WHEN** 实现 FrameworkAdapter
- **THEN** adapter.runtime 包含 createState、createComputed 等运行时工厂函数

### Requirement: Vue adapter preset

系统必须提供 vueParserConfig 预设配置。

#### Scenario: Vue config includes Vue-specific prefixes
- **WHEN** 使用 vueParserConfig
- **THEN** referencePrefixes 包含 `['props', 'state', 'computed']`

#### Scenario: Vue config includes Vue-specific scopes
- **WHEN** 使用 vueParserConfig
- **THEN** scopeNames 包含 `['core', 'goal']`

#### Scenario: Vue config includes key parsers
- **WHEN** 使用 vueParserConfig
- **THEN** keyParsers 包含组件名转换函数

### Requirement: Framework-specific runtime factories

系统必须为每个适配层定义框架特定的运行时工厂。

#### Scenario: Vue createState uses Vue ref/reactive
- **WHEN** vue-json 调用 createState
- **THEN** 返回 Vue ref 或 reactive 对象

#### Scenario: React createState uses React useState
- **WHEN** react-json 调用 createState
- **THEN** 返回 React useState hook 结果

### Requirement: Adapter type exports

系统必须从 core-engine 导出类型定义供适配层使用。

#### Scenario: Exports AbstractReference type
- **WHEN** 导入 `@json-engine/core-engine`
- **THEN** 可使用 AbstractReference 类型

#### Scenario: Exports AbstractScope type
- **WHEN** 导入 `@json-engine/core-engine`
- **THEN** 可使用 AbstractScope 类型

### Requirement: Future adapter interface compatibility

适配层接口必须向后兼容未来可能的扩展。

#### Scenario: Adding new runtime function doesn't break existing adapters
- **WHEN** FrameworkAdapter 接口新增可选方法
- **THEN** 现有适配层实现不需要修改

#### Scenario: New framework can implement adapter
- **WHEN** 新框架实现 FrameworkAdapter
- **THEN** 只需实现必需的属性和方法
