# core-engine-integration

core-engine 解析能力集成到 vue-json parser 系统。

## ADDED Requirements

### Requirement: Use parseJson for schema preprocessing

系统必须在 parseSchema 入口处调用 `@json-engine/core-engine` 的 `parseJson` 函数预处理所有 JSON Schema 输入。

#### Scenario: Preprocess string input
- **WHEN** parseSchema 接收 JSON 字符串输入
- **THEN** 系统先 JSON.parse 再调用 parseJson 预处理

#### Scenario: Preprocess object input
- **WHEN** parseSchema 接收对象输入
- **THEN** 系统直接调用 parseJson 预处理

#### Scenario: Resolve nested references
- **WHEN** Schema 包含 `{{ref_state_xxx}}` 或 `{{ref_props_xxx}}` 引用
- **THEN** parseJson 解析引用并返回结构化数据

### Requirement: Use parseNestedReference for expression evaluation

系统必须在 evaluateExpression 中使用 `parseNestedReference` 解析表达式中的引用。

#### Scenario: Parse state reference
- **WHEN** 表达式为 `{{ref_state_count}}`
- **THEN** parseNestedReference 返回 `{ type: 'state', variable: 'count' }`

#### Scenario: Parse props reference
- **WHEN** 表达式为 `{{ref_props_title}}`
- **THEN** parseNestedReference 返回 `{ type: 'props', variable: 'title' }`

#### Scenario: Parse scope reference
- **WHEN** 表达式为 `{{$_[core]_config}}`
- **THEN** parseNestedReference 返回 `{ type: 'scope', scope: 'core', variable: 'config' }`

#### Scenario: Fallback for non-reference expressions
- **WHEN** 表达式不匹配 core-engine 格式（如 `{{a + b}}`）
- **THEN** 系统保持原有求值逻辑

### Requirement: Provide KeyParser registration API

系统必须提供 KeyParser 注册机制，允许用户自定义 key 映射。

#### Scenario: Register custom KeyParser
- **WHEN** 用户调用 `registerVueJsonKeyParser(name, parser)`
- **THEN** 系统注册到 core-engine 的 globalKeyParserRegistry

#### Scenario: Apply KeyParser during parsing
- **WHEN** parseJson 处理 Schema 时遇到已注册的 key
- **THEN** 系统调用 KeyParser 转换 key 名称

#### Scenario: Unregister KeyParser
- **WHEN** 用户调用 `unregisterVueJsonKeyParser(name)`
- **THEN** 系统从 globalKeyParserRegistry 移除该 parser

### Requirement: Provide default KeyParsers

系统必须提供默认的 KeyParser 配置。

#### Scenario: Transform component names
- **WHEN** Schema 中的组件名为 kebab-case（如 `my-component`）
- **THEN** 系统转换为 PascalCase（如 `MyComponent`）

#### Scenario: Validate state keys
- **WHEN** state 键名不符合变量命名规范
- **THEN** 系统抛出 ValidationError

### Requirement: Import core-engine types

系统必须导入并使用 core-engine 的类型定义。

#### Scenario: Use NestedReferenceData type
- **WHEN** 处理解析后的引用数据
- **THEN** 系统使用 NestedReferenceData 类型约束

#### Scenario: Use ParseResult type
- **WHEN** parseJson 返回结果
- **THEN** 系统使用 core-engine 的 ParseResult 类型