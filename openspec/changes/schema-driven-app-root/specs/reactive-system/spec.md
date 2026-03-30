## ADDED Requirements

### Requirement: CoreScope loader API
系统必须在 CoreScope 中提供 `_loader` API 用于动态 Schema 加载。

#### Scenario: Access loader from schema
- **WHEN** schema 方法或表达式中访问 `scope._loader`
- **THEN** 返回包含 `load`、`clearCache`、`preload` 方法的对象

#### Scenario: Load schema via loader
- **WHEN** `scope._loader.load('/path/schema.json')` 被调用
- **THEN** 返回 `{ success: boolean, component?: Component, error?: Error }`

#### Scenario: Clear loader cache
- **WHEN** `scope._loader.clearCache()` 被调用
- **THEN** 所有已加载的 Schema 缓存被清除

#### Scenario: Preload schemas
- **WHEN** `scope._loader.preload(['/a.json', '/b.json'])` 被调用
- **THEN** schemas 并行预加载到缓存

### Requirement: CoreScope router API
系统必须在 CoreScope 中提供 `_router` API 用于路由操作。

#### Scenario: Access router from schema
- **WHEN** schema 方法或表达式中访问 `scope._router`
- **THEN** 返回包含 `push`、`replace`、`currentRoute` 的对象

#### Scenario: Navigate via router
- **WHEN** `scope._router.push('/dashboard')` 被调用
- **THEN** hash 路由更新到 `/dashboard`

#### Scenario: Get current route
- **WHEN** `scope._router.currentRoute` 被访问
- **THEN** 返回当前路由路径字符串

#### Scenario: Replace route
- **WHEN** `scope._router.replace('/login')` 被调用
- **THEN** 路由被替换且无历史记录

### Requirement: Extended CoreScope interface
系统必须扩展 CoreScope 接口以包含新增的 API。

#### Scenario: CoreScope contains all APIs
- **WHEN** `createCoreScope()` 被调用
- **THEN** 返回包含 `_auth`、`_i18n`、`_storage`、`_api`、`_ws`、`_loader`、`_router` 的完整对象

#### Scenario: Use CoreScope in schema expression
- **WHEN** 表达式使用 `ref_scope__loader_load_xxx`
- **THEN** 系统正确解析并调用 loader API