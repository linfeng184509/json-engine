# json-schema-parser (delta)

JSON Schema 结构解析和验证能力 - core-engine 集成变更。

## MODIFIED Requirements

### Requirement: Integrate with core-engine parseJson

系统必须使用 `@json-engine/core-engine` 的 `parseJson` 函数预处理 JSON Schema。

#### Scenario: Preprocess with parseJson
- **WHEN** 解析包含嵌套引用的 JSON Schema
- **THEN** 系统调用 `parseJson` 预处理，解析所有 `{{ref_state_*}}`、`{{ref_props_*}}` 和 `{{$_[*]_*}}` 引用

#### Scenario: Use KeyParser for key mapping
- **WHEN** 注册了 KeyParser 映射
- **THEN** 系统使用 KeyParser 转换组件名、状态键名等

#### Scenario: parseJson is mandatory
- **WHEN** parseSchema 函数被调用
- **THEN** 系统必须调用 parseJson，不得跳过预处理步骤

## REMOVED Requirements

### Requirement: Support legacy expression format

**Reason**: 表达式格式统一为 core-engine 规范，移除 `{{count}}` 等原有格式支持

**Migration**: 用户需将 Schema 中的表达式改为 core-engine 格式：
- `{{count}}` → `{{ref_state_count}}`
- `{{props.title}}` → `{{ref_props_title}}`
- `{{state.user.name}}` → `{{ref_state_user}}.name`（嵌套访问）