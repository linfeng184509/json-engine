# json-schema-parser

JSON Schema 结构解析和验证能力。

## ADDED Requirements

### Requirement: Parse VueJsonSchema structure

系统必须能够解析符合 VueJsonSchema 接口的 JSON 对象，提取所有模块定义。

#### Scenario: Parse valid schema
- **WHEN** 输入有效的 VueJsonSchema JSON 对象
- **THEN** 系统返回解析后的 Schema 对象，包含所有模块配置

#### Scenario: Parse invalid schema
- **WHEN** 输入无效的 JSON 或缺少必需字段
- **THEN** 系统抛出 SchemaParseError，包含具体错误位置和原因

### Requirement: Validate schema structure

系统必须验证 JSON Schema 的结构完整性，确保所有必需字段存在且类型正确。

#### Scenario: Validate required fields
- **WHEN** schema 缺少 `name` 或 `render` 字段
- **THEN** 系统抛出 ValidationError，提示缺少必需字段

#### Scenario: Validate field types
- **WHEN** schema 中的字段类型不正确（如 `state` 不是对象）
- **THEN** 系统抛出 TypeError，指出具体字段和期望类型

### Requirement: Integrate with core-engine parseJson

系统必须使用 `@json-engine/core-engine` 的 `parseJson` 函数预处理 JSON Schema。

#### Scenario: Preprocess with parseJson
- **WHEN** 解析包含嵌套引用的 JSON Schema
- **THEN** 系统调用 `parseJson` 预处理，解析所有 `{{ref_*}}` 和 `{{$_[*]_*}}` 引用

#### Scenario: Use KeyParser for key mapping
- **WHEN** 注册了 KeyParser 映射
- **THEN** 系统使用 KeyParser 转换组件名、状态键名等

### Requirement: Support incremental parsing

系统必须支持增量解析，允许单独解析各个模块。

#### Scenario: Parse props only
- **WHEN** 调用 `parseProps(schema.props)`
- **THEN** 系统仅解析 props 模块，返回 PropsOptions 对象

#### Scenario: Parse state only
- **WHEN** 调用 `parseState(schema.state)`
- **THEN** 系统仅解析 state 模块，返回 StateConfig 对象

### Requirement: Provide parsing context

系统必须在解析过程中提供上下文信息，包括错误追踪和警告收集。

#### Scenario: Track parsing errors
- **WHEN** 解析过程中发生多个错误
- **THEN** 系统收集所有错误，最终一次性抛出包含所有错误信息的 AggregateError

#### Scenario: Collect warnings
- **WHEN** 解析过程中发现非致命问题（如废弃的字段）
- **THEN** 系统收集警告信息，继续解析，最终返回 warnings 数组

## MODIFIED Requirements

### Requirement: Use ParserConfig for parseJson integration

**原内容：** 系统必须使用 `@json-engine/core-engine` 的 `parseJson` 函数预处理 JSON Schema，通过全局 KeyParserRegistry 注册映射。

**新内容：** 系统必须使用 `@json-engine/core-engine` 的 `parseJson` 函数和 ParserConfig 对象预处理 JSON Schema，不再使用全局 KeyParserRegistry。

#### Scenario: Parse with custom config
- **WHEN** 调用 parseSchema 并传入自定义 ParserConfig
- **THEN** parseJson 使用该配置进行解析

#### Scenario: Parse without global side effects
- **WHEN** 多次调用 parseSchema
- **THEN** 每次调用使用独立配置，不产生全局副作用

### Requirement: Support dynamic reference prefixes

**原内容：** 系统解析 `{{ref_props_*}}` 和 `{{ref_state_*}}` 格式的引用。

**新内容：** 系统根据配置的 referencePrefixes 解析任意格式的引用前缀。

#### Scenario: Parse custom prefix reference
- **WHEN** config.referencePrefixes 包含 'custom'
- **AND** 输入包含 `{{ref_custom_value}}`
- **THEN** 正确解析为 custom 前缀的引用
