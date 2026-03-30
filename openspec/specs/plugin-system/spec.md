# plugin-system

插件注册表和核心插件机制。

## ADDED Requirements

### Requirement: Support plugin declaration in Schema

系统必须支持在 Schema 中声明插件。

#### Scenario: Declare plugins in schema
- **WHEN** Schema 包含 `plugins: [{ name: "@json-engine/plugin-axios", version: "^0.0.1" }]`
- **THEN** 系统解析并安装声明的插件

#### Scenario: Plugin config in schema
- **WHEN** Schema 包含 `config: { axios: { baseURL: "/api" } }`
- **THEN** 系统将配置传递给对应插件

### Requirement: Version validation

系统必须验证插件版本兼容性。

#### Scenario: Compatible version
- **WHEN** 插件版本为 `0.0.2`，核心版本为 `0.0.1`
- **THEN** 验证通过（主次版本相同）

#### Scenario: Incompatible version
- **WHEN** 插件版本为 `0.1.0`，核心版本为 `0.0.1`
- **THEN** 抛出版本不兼容错误

### Requirement: Config validation

系统必须验证插件配置。

#### Scenario: Valid config
- **WHEN** 插件配置符合其 JSON Schema
- **THEN** 配置被接受

#### Scenario: Invalid config
- **WHEN** 插件配置不符合其 JSON Schema
- **THEN** 抛出配置验证错误

### Requirement: Scope extension

系统必须支持插件扩展 CoreScope。

#### Scenario: Register scope extension
- **WHEN** 插件注册 `_api` Scope 扩展
- **THEN** CoreScope 包含 `_api` 属性

#### Scenario: Access scope in expression
- **WHEN** 表达式中使用 `$_[core]_api.get(...)`
- **THEN** 调用插件提供的 `_api` 方法

### Requirement: Peer dependency check

系统必须检查 peerDependencies。

#### Scenario: Missing peer dependency
- **WHEN** 插件声明 `peerDependencies: { axios: "^1.0.0" }` 且未安装
- **THEN** 输出友好提示：`Please run: npm install axios`

#### Scenario: Peer dependency installed
- **WHEN** 插件声明 peerDependencies 且已安装
- **THEN** 正常加载插件