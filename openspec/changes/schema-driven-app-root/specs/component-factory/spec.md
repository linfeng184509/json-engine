## ADDED Requirements

### Requirement: Support built-in PageLoader component
系统必须支持 PageLoader 作为内置组件，无需通过 extraComponents 注册。

#### Scenario: Use PageLoader in schema render
- **WHEN** schema render 中使用 `{ type: "PageLoader", props: { schemaPath: "..." } }`
- **THEN** 系统自动识别并渲染 PageLoader 组件

#### Scenario: PageLoader is always available
- **WHEN** createComponent 被调用时未提供 extraComponents
- **THEN** PageLoader 仍然可用

### Requirement: Support dynamic component creation options
系统必须支持扩展的 createComponent 选项用于动态加载场景。

#### Scenario: Create component with schema path
- **WHEN** createComponent 被调用时 schema 包含动态引用
- **THEN** 系统正确解析引用并创建组件

#### Scenario: Pass loader context to component
- **WHEN** createComponent 选项包含 `{ loader: schemaLoader }`
- **THEN** 组件可通过 scope._loader 访问加载器

### Requirement: Register PageLoader at component creation
系统必须在 createComponent 时自动注册 PageLoader。

#### Scenario: PageLoader registered in components
- **WHEN** createComponent 解析 schema
- **THEN** PageLoader 自动添加到可用组件列表

#### Scenario: PageLoader respects custom extraComponents
- **WHEN** extraComponents 包含自定义 PageLoader
- **THEN** 使用自定义版本而非内置版本