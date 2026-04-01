# plugin-axios

Axios HTTP 客户端插件，提供 `_api` Scope。

## ADDED Requirements

### Requirement: Register axios plugin

系统必须支持注册 axios 插件。

#### Scenario: Plugin declaration
- **WHEN** Schema 中声明 `{ name: "@json-engine/plugin-axios" }`
- **THEN** 系统加载并初始化 axios 插件

### Requirement: Provide _api scope

插件必须提供 `_api` Scope 扩展。

#### Scenario: API get request
- **WHEN** 调用 `$_core_api.get("/users")`
- **THEN** 发送 GET 请求并返回响应

#### Scenario: API post request
- **WHEN** 调用 `$_core_api.post("/users", { name: "test" })`
- **THEN** 发送 POST 请求并返回响应

#### Scenario: Auto attach auth token
- **WHEN** Storage 中存在 token
- **THEN** 请求自动添加 `Authorization: Bearer <token>` 头

### Requirement: Support axios config

插件必须支持 axios 配置。

#### Scenario: Configure baseURL
- **WHEN** 配置 `{ axios: { baseURL: "/api/v1" } }`
- **THEN** 所有请求使用该 baseURL

#### Scenario: Configure timeout
- **WHEN** 配置 `{ axios: { timeout: 5000 } }`
- **THEN** 请求超时时间为 5 秒

#### Scenario: Configure retry
- **WHEN** 配置 `{ axios: { retry: { count: 3, delay: 1000 } } }`
- **THEN** 失败请求自动重试 3 次

### Requirement: Support api-call value type

插件必须支持 `{ type: 'api-call', ... }` 值类型。

#### Scenario: Parse api-call
- **WHEN** 解析 `{ type: 'api-call', method: 'GET', url: '/users' }`
- **THEN** 返回 `{ _type: 'api-call', method: 'GET', url: '/users' }`

#### Scenario: Resolve api-call at runtime
- **WHEN** 运行时解析 `_type: 'api-call'` 值
- **THEN** 执行对应 HTTP 请求并返回结果