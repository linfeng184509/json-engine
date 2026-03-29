# vue-parser-config

Vue 特定解析器配置，使用 core-engine 的 ParserConfig 架构。

## ADDED Requirements

### Requirement: VueParserConfig preset

系统必须提供 vueParserConfig 预设配置，复用 core-engine 的 createParserConfig。

#### Scenario: Create Vue config with default settings
- **WHEN** 调用 `createVueParserConfig()`
- **THEN** 返回包含 Vue 特定 prefixes 和 scopes 的 ParserConfig

#### Scenario: Vue config includes Vue-specific prefixes
- **WHEN** 使用 vueParserConfig
- **THEN** referencePrefixes 包含 `['props', 'state', 'computed']`

#### Scenario: Vue config includes Vue-specific scopes
- **WHEN** 使用 vueParserConfig
- **THEN** scopeNames 包含 `['core', 'goal']`

### Requirement: Vue key parsers

系统必须在 vueParserConfig 中注册 Vue 特定的 key 转换器。

#### Scenario: Register component name key parser
- **WHEN** 创建 vueParserConfig
- **THEN** keyParsers 包含组件名转换函数

### Requirement: useVueParserConfig hook

系统必须提供 useVueParserConfig 函数在组件级别使用配置。

#### Scenario: Create config with custom overrides
- **WHEN** 调用 `useVueParserConfig({ referencePrefixes: ['custom'] })`
- **THEN** 返回配置中只有 referencePrefixes 被覆盖
