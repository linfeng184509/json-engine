# permission-checker

权限检查器，提供基础权限验证方法。

## ADDED Requirements

### Requirement: has permission check

系统必须提供 `has(permission: string): boolean` 方法检查单个权限。

#### Scenario: Check with valid permission
- **WHEN** 调用 `checker.has('user.list.view')`
- **AND** 用户拥有此权限
- **THEN** 返回 `true`

#### Scenario: Check with invalid permission
- **WHEN** 调用 `checker.has('user.list.delete')`
- **AND** 用户不拥有此权限
- **THEN** 返回 `false`

### Requirement: hasAny permission check

系统必须提供 `hasAny(permissions: string[]): boolean` 方法检查是否拥有任一权限。

#### Scenario: Check any with one match
- **WHEN** 调用 `checker.hasAny(['user.list.view', 'user.list.edit'])`
- **AND** 用户拥有 `user.list.view`
- **THEN** 返回 `true`

#### Scenario: Check any with no match
- **WHEN** 调用 `checker.hasAny(['user.list.edit', 'user.list.delete'])`
- **AND** 用户不拥有任一权限
- **THEN** 返回 `false`

### Requirement: hasAll permission check

系统必须提供 `hasAll(permissions: string[]): boolean` 方法检查是否拥有所有权限。

#### Scenario: Check all with all match
- **WHEN** 调用 `checker.hasAll(['user.list.view', 'user.list.edit'])`
- **AND** 用户拥有所有权限
- **THEN** 返回 `true`

#### Scenario: Check all with partial match
- **WHEN** 调用 `checker.hasAll(['user.list.view', 'user.list.edit'])`
- **AND** 用户只拥有部分权限
- **THEN** 返回 `false`

### Requirement: hasRole check

系统必须提供 `hasRole(role: string): boolean` 方法检查角色。

#### Scenario: Check role match
- **WHEN** 调用 `checker.hasRole('admin')`
- **AND** 用户拥有 admin 角色
- **THEN** 返回 `true`

### Requirement: isPlatform check

系统必须提供 `isPlatform(platform: string): boolean` 方法检查平台。

#### Scenario: Check platform match
- **WHEN** 调用 `checker.isPlatform('pda')`
- **AND** 当前平台为 pda
- **THEN** 返回 `true`

### Requirement: canAccessPage check

系统必须提供 `canAccessPage(page: string): boolean` 方法检查页面访问权限。

#### Scenario: Check page access
- **WHEN** 调用 `checker.canAccessPage('user-list')`
- **AND** 用户拥有 `user.list.view` 权限
- **THEN** 返回 `true`
