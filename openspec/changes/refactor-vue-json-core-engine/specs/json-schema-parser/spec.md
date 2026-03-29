# json-schema-parser (delta)

JSON Schema 结构解析和验证能力 - 完全重构版本。

## MODIFIED Requirements

### Requirement: Parse VueJsonSchema structure

系统必须能够解析符合新结构化格式的 VueJsonSchema。

#### Scenario: Parse valid structured schema
- **WHEN** 输入使用结构化类型（ExpressionValue、FunctionValue 等）的有效 Schema
- **THEN** 系统调用 parseJson 预处理，返回解析后的结构化 Schema

#### Scenario: Reject legacy string format
- **WHEN** Schema 使用旧格式（如直接字符串 `"ref_state_count"`）
- **THEN** 系统抛出 ValidationError，提示使用结构化格式

### Requirement: Validate schema structure

系统必须验证 Schema 的结构完整性，确保所有结构化值类型正确。

#### Scenario: Validate ExpressionValue
- **WHEN** 值声明为 `{ type: 'expression' }`
- **THEN** 系统验证 body 字段存在且为字符串

#### Scenario: Validate FunctionValue
- **WHEN** 值声明为 `{ type: 'function' }`
- **THEN** 系统验证 params 和 body 字段存在

#### Scenario: Validate StateRef
- **WHEN** 值声明为 `{ type: 'state' }`
- **THEN** 系统验证 variable 字段存在且为有效变量名

## REMOVED Requirements

### Requirement: Support legacy string expression format

**Reason**: 完全迁移到 core-engine 结构化格式

**Migration**: 所有字符串表达式改为结构化对象：
- `"{{ref_state_count}}"` → `{ "type": "expression", "body": "{{ref_state_count}}" }`
- `"ref_state_count"` → `{ "type": "state", "variable": "count" }`

### Requirement: Support legacy function string format

**Reason**: 完全迁移到 core-engine 结构化格式

**Migration**: 所有函数体字符串改为结构化对象：
- `"state.count.value++"` → `{ "type": "function", "params": "", "body": "state.count.value++" }`