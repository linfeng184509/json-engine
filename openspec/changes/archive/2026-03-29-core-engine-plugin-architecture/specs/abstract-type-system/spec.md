# abstract-type-system

core-engine 抽象类型系统，移除框架特定语义，使用通用类型描述。

## ADDED Requirements

### Requirement: ReferenceParseData with prefix field

系统必须使用抽象 Reference 类型，prefix 字段标识引用类别。

#### Scenario: Parse reference with custom prefix
- **WHEN** 引用格式为 `{{ref_customVar_xxx}}`
- **AND** referencePrefixes 包含 'customVar'
- **THEN** 解析结果为 `{ _type: 'reference', prefix: 'customVar', variable: 'xxx' }`

#### Scenario: Support nested path in reference
- **WHEN** 引用格式为 `{{ref_props_user.name}}`
- **AND** referencePrefixes 包含 'props'
- **THEN** 解析结果为 `{ _type: 'reference', prefix: 'props', variable: 'user', path: 'name' }`

### Requirement: ScopeParseData with dynamic scope name

系统必须支持自定义 scope 名称，不限于 'core'/'goal'。

#### Scenario: Parse scope with custom name
- **WHEN** scope 格式为 `{{$_global_config}}`
- **AND** scopeNames 包含 'global'
- **THEN** 解析结果为 `{ _type: 'scope', scope: 'global', variable: 'config' }`

#### Scenario: Invalid scope name returns raw string
- **WHEN** scope 格式为 `{{$_unknown_var}}`
- **AND** scopeNames 不包含 'unknown'
- **THEN** 解析结果为原始字符串 `{{$_unknown_var}}`

### Requirement: ExpressionParseData with _type marker

系统必须为表达式解析结果添加 `_type` 标记。

#### Scenario: Parse expression with _type
- **WHEN** 输入 `{ type: 'expression', body: '{{a + b}}' }`
- **THEN** 解析结果包含 `_type: 'expression'` 字段

#### Scenario: Expression with pure reference returns typed reference
- **WHEN** 输入 `{ type: 'expression', body: '{{ref_state_count}}' }`
- **AND** referencePrefixes 包含 'state'
- **THEN** 解析结果为 `{ _type: 'expression', expression: { _type: 'reference', prefix: 'state', variable: 'count' } }`

### Requirement: FunctionParseData with _type marker

系统必须为函数解析结果添加 `_type` 标记。

#### Scenario: Parse function with _type
- **WHEN** 输入 `{ type: 'function', params: '{{{}}}', body: '{{return x}}' }`
- **THEN** 解析结果为 `{ _type: 'function', params: {}, body: 'return x' }`

### Requirement: TypedParseResult interface

系统必须提供通用 TypedParseResult 接口约束带类型的解析结果。

#### Scenario: Type narrowing with _type
- **WHEN** 获取解析结果后检查 `_type` 字段
- **THEN** 可通过 `_type` 判断原始类型并进行类型收窄
