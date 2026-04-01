# field-permission

字段权限控制，支持读/写/隐藏/隐私四种级别。

## ADDED Requirements

### Requirement: FieldPermission type

系统必须定义 FieldPermission 类型。

#### Scenario: Field permission structure
- **WHEN** 定义字段权限
- **THEN** 包含 `read`, `write`, `hidden`, `privacy` 四个布尔属性

### Requirement: getFieldPermission

系统必须提供 `getFieldPermission(page: string, field: string): FieldPermission` 方法。

#### Scenario: Get field permission
- **WHEN** 调用 `checker.getFieldPermission('user-list', 'phone')`
- **THEN** 返回 `{ read: true, write: true, hidden: false, privacy: true }`

### Requirement: canReadField check

系统必须提供 `canReadField(page: string, field: string): boolean` 方法。

#### Scenario: Check field readable
- **WHEN** 调用 `checker.canReadField('user-list', 'phone')`
- **AND** 字段可读
- **THEN** 返回 `true`

### Requirement: canWriteField check

系统必须提供 `canWriteField(page: string, field: string): boolean` 方法。

#### Scenario: Check field writable
- **WHEN** 调用 `checker.canWriteField('user-list', 'phone')`
- **AND** 字段可写
- **THEN** 返回 `true`

### Requirement: isFieldHidden check

系统必须提供 `isFieldHidden(page: string, field: string): boolean` 方法。

#### Scenario: Check field hidden
- **WHEN** 调用 `checker.isFieldHidden('user-list', 'salary')`
- **AND** 字段被隐藏
- **THEN** 返回 `true`

### Requirement: isFieldPrivate check

系统必须提供 `isFieldPrivate(page: string, field: string): boolean` 方法。

#### Scenario: Check field privacy
- **WHEN** 调用 `checker.isFieldPrivate('user-list', 'phone')`
- **AND** 字段为隐私字段
- **THEN** 返回 `true`

### Requirement: Core Scope integration

系统必须在 Core Scope 中暴露字段权限方法。

#### Scenario: Access via Core Scope
- **WHEN** 在表达式中调用 `$_core_auth.canReadField('user-list', 'phone')`
- **THEN** 返回字段是否可读
