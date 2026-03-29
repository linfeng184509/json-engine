# permission-provider

权限提供者接口，定义权限数据来源标准。

## ADDED Requirements

### Requirement: PermissionProvider interface

系统必须提供 PermissionProvider 接口，定义权限数据来源。

#### Scenario: Provider returns permission list
- **WHEN** 调用 `provider.getPermissions()`
- **THEN** 返回当前用户权限列表 `string[]`

#### Scenario: Provider returns role list
- **WHEN** 调用 `provider.getRoles()`
- **THEN** 返回当前用户角色列表 `string[]`

#### Scenario: Provider returns platform
- **WHEN** 调用 `provider.getPlatform()`
- **THEN** 返回当前平台代码 `'pc-browser' | 'pc-client' | 'pda' | 'pad'`

#### Scenario: Provider checks permission
- **WHEN** 调用 `provider.checkPermission('xxx')`
- **THEN** 返回布尔值表示是否有此权限

#### Scenario: Provider returns field permission
- **WHEN** 调用 `provider.getFieldPermission(page, field)`
- **THEN** 返回字段权限对象 `{ read: boolean, write: boolean, hidden: boolean, privacy: boolean }`

#### Scenario: Provider returns SOP step permission
- **WHEN** 调用 `provider.getSOPStepPermission(sop, step)`
- **THEN** 返回 SOP 步骤权限对象 `{ canExecute: boolean, canView: boolean, availableFields: string[] }`

### Requirement: DefaultPermissionProvider

系统必须提供默认的空权限提供者。

#### Scenario: Default provider returns empty permissions
- **WHEN** 使用默认 Provider
- **THEN** `getPermissions()` 返回 `[]`
- **AND** `getRoles()` 返回 `[]`
- **AND** `getPlatform()` 返回 `'pc-browser'`
- **AND** `checkPermission()` 返回 `false`

### Requirement: registerPermissionProvider

系统必须提供注册自定义 Provider 的方法。

#### Scenario: Register custom provider
- **WHEN** 调用 `registerPermissionProvider(customProvider)`
- **THEN** 后续权限检查使用自定义 Provider
