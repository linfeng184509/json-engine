# plugin-storage

浏览器存储插件，提供 `_storage` Scope。

## ADDED Requirements

### Requirement: Register storage plugin

系统必须支持注册 storage 插件。

#### Scenario: Plugin declaration
- **WHEN** Schema 中声明 `{ name: "@json-engine/plugin-storage" }`
- **THEN** 系统加载并初始化 storage 插件

### Requirement: Provide _storage scope

插件必须提供 `_storage` Scope 扩展。

#### Scenario: Get value
- **WHEN** 调用 `$_[core]_storage.get("key")`
- **THEN** 返回存储的值

#### Scenario: Set value
- **WHEN** 调用 `$_[core]_storage.set("key", value)`
- **THEN** 存储值

#### Scenario: Remove value
- **WHEN** 调用 `$_[core]_storage.remove("key")`
- **THEN** 删除存储的值

#### Scenario: Sync value
- **WHEN** 调用 `$_[core]_storage.sync("key", value)`
- **THEN** 存储值并触发跨标签页同步

### Requirement: Support storage config

插件必须支持存储配置。

#### Scenario: Configure prefix
- **WHEN** 配置 `{ storage: { prefix: "app_" } }`
- **THEN** 所有 key 添加前缀

#### Scenario: Configure encrypt
- **WHEN** 配置 `{ storage: { encrypt: true, encryptKey: "secret" } }`
- **THEN** 存储时加密数据

#### Scenario: Configure sync
- **WHEN** 配置 `{ storage: { sync: true } }`
- **THEN** 启用跨标签页同步

#### Scenario: Configure type
- **WHEN** 配置 `{ storage: { type: "sessionStorage" } }`
- **THEN** 使用 sessionStorage 代替 localStorage