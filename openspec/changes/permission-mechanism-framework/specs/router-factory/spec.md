# router-factory

路由配置解析、动态路由注册、路由守卫。

## ADDED Requirements

### Requirement: VueJsonRouterSchema structure

系统必须定义路由 Schema 类型。

#### Scenario: Basic router config
- **WHEN** 定义路由配置
- **THEN** 包含 `history`, `routes`, `guards` 字段

### Requirement: Route definition

系统必须支持标准路由定义。

#### Scenario: Static route
- **WHEN** 配置 `{ "path": "/", "component": "./pages/Home.json" }`
- **THEN** 系统创建静态路由

#### Scenario: Dynamic route
- **WHEN** 配置 `{ "path": "/user/:id", "component": "./pages/User.json" }`
- **THEN** 系统创建带参数的动态路由

#### Scenario: Nested routes
- **WHEN** 配置嵌套路由
- **THEN** 系统创建嵌套路由结构

### Requirement: Route guards

系统必须支持路由守卫配置。

#### Scenario: beforeEach guard
- **WHEN** 配置 `guards.beforeEach`
- **THEN** 系统在路由跳转前执行守卫函数

#### Scenario: afterEach guard
- **WHEN** 配置 `guards.afterEach`
- **THEN** 系统在路由跳转后执行守卫函数

### Requirement: Route permissions

系统必须支持基于权限的路由访问控制。

#### Scenario: Protected route
- **WHEN** 配置路由需要特定权限
- **THEN** 无权限时跳转到登录或 403 页面

### Requirement: createRouter function

系统必须提供 `createRouter(config)` 函数创建路由实例。

#### Scenario: Create router with config
- **WHEN** 调用 `createRouter(routerConfig)`
- **THEN** 返回 Vue Router 实例
