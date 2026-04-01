# plugin-router

Vue Router 插件，提供 `_router` Scope。

## ADDED Requirements

### Requirement: Register router plugin

系统必须支持注册 router 插件。

#### Scenario: Plugin declaration
- **WHEN** Schema 中声明 `{ name: "@json-engine/plugin-router" }`
- **THEN** 系统加载并初始化 router 插件

### Requirement: Provide _router scope

插件必须提供 `_router` Scope 扩展。

#### Scenario: Navigate push
- **WHEN** 调用 `$_core_router.push("/users")`
- **THEN** 导航到 /users 路由

#### Scenario: Navigate back
- **WHEN** 调用 `$_core_router.back()`
- **THEN** 返回上一页

#### Scenario: Get current route
- **WHEN** 访问 `$_core_router.currentRoute`
- **THEN** 返回当前路由路径

### Requirement: Support router config

插件必须支持路由配置。

#### Scenario: Configure mode
- **WHEN** 配置 `{ router: { mode: "hash" } }`
- **THEN** 使用 hash 模式路由

#### Scenario: Configure base
- **WHEN** 配置 `{ router: { base: "/app" } }`
- **THEN** 路由基础路径为 /app

### Requirement: Support route definition

插件必须支持在 Schema 中定义路由。

#### Scenario: Define routes in schema
- **WHEN** Schema 包含 `router: { routes: [{ path: "/", component: "Home" }] }`
- **THEN** 创建对应路由配置

#### Scenario: Support nested routes
- **WHEN** Schema 定义嵌套路由
- **THEN** 正确渲染嵌套路由