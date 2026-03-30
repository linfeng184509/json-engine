# plugin-auth

权限认证插件，提供 `_auth` Scope。

## ADDED Requirements

### Requirement: Register auth plugin

系统必须支持注册 auth 插件。

#### Scenario: Plugin declaration
- **WHEN** Schema 中声明 `{ name: "@json-engine/plugin-auth" }`
- **THEN** 系统加载并初始化 auth 插件

### Requirement: Provide _auth scope

插件必须提供 `_auth` Scope 扩展。

#### Scenario: Check permission
- **WHEN** 调用 `$_[core]_auth.has("user:read")`
- **THEN** 返回是否有该权限

#### Scenario: Check any permission
- **WHEN** 调用 `$_[core]_auth.hasAny(["user:read", "user:write"])`
- **THEN** 返回是否有任一权限

#### Scenario: Check all permissions
- **WHEN** 调用 `$_[core]_auth.hasAll(["user:read", "user:write"])`
- **THEN** 返回是否有所有权限

#### Scenario: Check role
- **WHEN** 调用 `$_[core]_auth.hasRole("admin")`
- **THEN** 返回是否有该角色

### Requirement: Support field permission

插件必须支持字段级权限。

#### Scenario: Check field read permission
- **WHEN** 调用 `$_[core]_auth.canReadField("user", "email")`
- **THEN** 返回是否可读

#### Scenario: Check field write permission
- **WHEN** 调用 `$_[core]_auth.canWriteField("user", "email")`
- **THEN** 返回是否可写

#### Scenario: Check field hidden
- **WHEN** 调用 `$_[core]_auth.isFieldHidden("user", "salary")`
- **THEN** 返回是否隐藏

### Requirement: Support auth config

插件必须支持权限配置。

#### Scenario: Configure permission provider
- **WHEN** 配置 `{ auth: { permissionProvider: customProvider } }`
- **THEN** 使用自定义权限提供者

#### Scenario: Configure page permissions
- **WHEN** 配置 `{ auth: { pagePermissions: { "/admin": "admin:access" } } }`
- **THEN** 路由守卫检查页面权限

### Requirement: Support v-auth directive

插件必须支持 v-auth 指令。

#### Scenario: v-auth directive
- **WHEN** 元素有 `v-auth: "'user:read'"`
- **THEN** 无权限时隐藏元素

#### Scenario: v-auth-any directive
- **WHEN** 元素有 `v-auth-any: "['user:read', 'user:write']"`
- **THEN** 无任一权限时隐藏