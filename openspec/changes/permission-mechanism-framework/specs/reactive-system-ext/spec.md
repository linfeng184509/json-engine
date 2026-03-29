# reactive-system-ext

扩展 RenderContext 增加 auth/api/ws/storage/i18n 等服务。

## ADDED Requirements

### Requirement: Extend RenderContext

系统必须扩展 RenderContext 类型。

#### Scenario: Add auth to context
- **WHEN** 访问 RenderContext
- **THEN** 包含 `auth: AuthAPI` 属性

#### Scenario: Add api to context
- **WHEN** 访问 RenderContext
- **THEN** 包含 `api: AxiosInstance` 属性

#### Scenario: Add ws to context
- **WHEN** 访问 RenderContext
- **THEN** 包含 `ws: WebSocketClient` 属性

#### Scenario: Add storage to context
- **WHEN** 访问 RenderContext
- **THEN** 包含 `storage: StorageAPI` 属性

#### Scenario: Add i18n to context
- **WHEN** 访问 RenderContext
- **THEN** 包含 `i18n: I18nAPI` 属性

### Requirement: AuthAPI in Core Scope

系统必须在 Core Scope 中暴露 auth 方法。

#### Scenario: Access auth via Core Scope
- **WHEN** 在表达式中调用 `$_[core]_auth.has('xxx')`
- **THEN** 返回权限检查结果

### Requirement: Api in Core Scope

系统必须在 Core Scope 中暴露 api 方法。

#### Scenario: Access api via Core Scope
- **WHEN** 在表达式中调用 `$_[core]_api.get('/users')`
- **THEN** 返回 HTTP 请求结果

### Requirement: I18n in Core Scope

系统必须在 Core Scope 中暴露 i18n 方法。

#### Scenario: Access i18n via Core Scope
- **WHEN** 在表达式中调用 `$_[core]_i18n.t('common.save')`
- **THEN** 返回翻译文本
