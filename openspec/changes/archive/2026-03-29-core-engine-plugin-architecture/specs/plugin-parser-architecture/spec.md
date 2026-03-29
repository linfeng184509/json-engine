# plugin-parser-architecture

core-engine 插件化 Parser 架构，支持通过配置对象注册自定义解析器。

## ADDED Requirements

### Requirement: ParserConfig object injection

系统必须接受 ParserConfig 对象作为 parseJson 的可选参数，所有配置通过参数传递而非全局注册。

#### Scenario: Parse with default config
- **WHEN** 调用 `parseJson(input)` 不传入 config
- **THEN** 系统使用默认配置，包含标准引用前缀和 scope

#### Scenario: Parse with custom config
- **WHEN** 调用 `parseJson(input, { referencePrefixes: ['custom'], scopeNames: ['global'] })`
- **THEN** 系统使用自定义配置解析引用和 scope

#### Scenario: Config does not affect global state
- **WHEN** 调用 `parseJson(input, configA)` 然后调用 `parseJson(input, configB)`
- **THEN** 两次调用互不影响，各自使用独立配置

### Requirement: Custom ValueParser registration

系统必须支持注册自定义 ValueParser，用于解析特定类型的值。

#### Scenario: Register custom value parser
- **WHEN** config.valueParsers 包含 `{ myType: myParserFn }`
- **AND** 输入 JSON 包含 `{ type: 'myType', body: '...' }`
- **THEN** 系统调用 myParserFn('...') 进行解析

#### Scenario: Custom parser overrides default
- **WHEN** 注册了与默认类型同名的自定义 parser
- **THEN** 自定义 parser 优先于默认 parser

#### Scenario: Built-in types not affected by custom parsers
- **WHEN** 注册自定义 `string` parser
- **THEN** 系统仍然正确处理 `type: 'string'` 的内置逻辑

### Requirement: Custom KeyParser registration

系统必须支持注册自定义 KeyParser，用于转换属性键名。

#### Scenario: Register custom key parser
- **WHEN** config.keyParsers 包含 `{ 'my-key': myKeyParserFn }`
- **AND** 输入 JSON 包含 `my-key: value`
- **THEN** 系统调用 myKeyParserFn('my-key') 转换键名

#### Scenario: Key parser runs on nested objects
- **WHEN** 注册了 key parser
- **AND** 输入 JSON 包含嵌套对象 `{ outer: { 'my-key': value } }`
- **THEN** 系统对内外层都应用 key 转换

### Requirement: createParserConfig factory function

系统必须提供 createParserConfig 工厂函数，简化配置创建。

#### Scenario: Create base config
- **WHEN** 调用 `createParserConfig()`
- **THEN** 返回包含默认值的 ParserConfig 对象

#### Scenario: Create config with custom options
- **WHEN** 调用 `createParserConfig({ referencePrefixes: ['custom'] })`
- **THEN** 返回配置中只有 referencePrefixes 被覆盖
