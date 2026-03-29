# data-filter

数据过滤器，自动处理字段过滤和隐私掩码。

## ADDED Requirements

### Requirement: filterFields

系统必须提供 `filterFields(data: Record<string, unknown>, page: string): Record<string, unknown>` 方法。

#### Scenario: Filter hidden fields
- **WHEN** 调用 `filterFields(userData, 'user-list')`
- **AND** `phone` 字段设置为隐藏
- **THEN** 返回的数据不包含 `phone` 字段

#### Scenario: Filter based on read permission
- **WHEN** 调用 `filterFields(userData, 'user-list')`
- **AND** 用户无 `user.field.salary.read` 权限
- **THEN** 返回的数据不包含 `salary` 字段

### Requirement: applyFieldPermission

系统必须提供 `applyFieldPermission(value: unknown, page: string, field: string): unknown` 方法处理隐私掩码。

#### Scenario: Mask phone number
- **WHEN** 调用 `applyFieldPermission('13812345678', 'user-list', 'phone')`
- **AND** `phone` 字段设置为隐私
- **THEN** 返回 `'138****5678'`

#### Scenario: Mask id card
- **WHEN** 调用 `applyFieldPermission('110101199001011234', 'user-list', 'idCard')`
- **AND** `idCard` 字段设置为隐私
- **THEN** 返回 `'*************1234'`

### Requirement: Default privacy patterns

系统必须提供默认的隐私掩码模式。

#### Scenario: Default patterns
- **WHEN** 使用默认模式
- **THEN** `phone` 使用 `{first3}****{last4}` 模式
- **AND** `idCard` 使用 `***********{last4}` 模式
- **AND** `email` 使用 `{first3}***@{domain}` 模式

### Requirement: Custom privacy patterns

系统必须支持自定义隐私掩码模式。

#### Scenario: Custom pattern in config
- **WHEN** 配置了自定义模式 `salary: '***'`
- **AND** 调用 `applyFieldPermission(10000, 'user-list', 'salary')`
- **THEN** 返回 `'***'`
