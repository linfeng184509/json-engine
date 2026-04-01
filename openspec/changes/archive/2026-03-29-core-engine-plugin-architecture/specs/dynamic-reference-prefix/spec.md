# dynamic-reference-prefix

core-engine 动态引用前缀配置，支持任意格式的引用前缀。

## ADDED Requirements

### Requirement: Configurable reference prefixes

系统必须支持配置任意引用前缀列表。

#### Scenario: Configure single prefix
- **WHEN** referencePrefixes 设置为 `['props']`
- **AND** 引用格式为 `{{ref_props_userId}}`
- **THEN** 正确解析为引用

#### Scenario: Configure multiple prefixes
- **WHEN** referencePrefixes 设置为 `['props', 'state', 'computed']`
- **AND** 引用格式为 `{{ref_state_count}}`
- **THEN** 正确解析为 state 引用

#### Scenario: Unknown prefix returns raw string
- **WHEN** referencePrefixes 设置为 `['props']`
- **AND** 引用格式为 `{{ref_state_xxx}}`
- **THEN** 解析结果为原始字符串 `{{ref_state_xxx}}`

### Requirement: Configurable scope names

系统必须支持配置任意 scope 名称列表。

#### Scenario: Configure single scope name
- **WHEN** scopeNames 设置为 `['global']`
- **AND** scope 格式为 `{{$_global_config}}`
- **THEN** 正确解析为 scope 引用

#### Scenario: Configure multiple scope names
- **WHEN** scopeNames 设置为 `['core', 'goal', 'global']`
- **AND** scope 格式为 `{{$_goal_target}}`
- **THEN** 正确解析为 goal scope

### Requirement: createReferenceRegex factory

系统必须提供 createReferenceRegex 函数生成动态正则。

#### Scenario: Generate regex for single prefix
- **WHEN** 调用 `createReferenceRegex(['props'])`
- **THEN** 返回正则 `/^\{\{ref_(props)_(.+)\}\}$/`

#### Scenario: Generate regex for multiple prefixes
- **WHEN** 调用 `createReferenceRegex(['props', 'state'])`
- **THEN** 返回正则 `/^\{\{ref_(props|state)_(.+)\}\}$/`

### Requirement: createScopeRegex factory

系统必须提供 createScopeRegex 函数生成动态正则。

#### Scenario: Generate regex for single scope
- **WHEN** 调用 `createScopeRegex(['core'])`
- **THEN** 返回正则 `/^\{\{\$_\[(core)\]_(.+)\}\}$/`

#### Scenario: Generate regex for multiple scopes
- **WHEN** 调用 `createScopeRegex(['core', 'goal'])`
- **THEN** 返回正则 `/^\{\{\$_\[(core|goal)\]_(.+)\}\}$/`
