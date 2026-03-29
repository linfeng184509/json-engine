# storage-factory

本地存储持久化、自动同步、加密。

## ADDED Requirements

### Requirement: StorageConfig structure

系统必须定义存储配置类型。

#### Scenario: Basic storage config
- **WHEN** 配置存储设置
- **THEN** 包含 `localStorage.prefix`, `localStorage.persist` 字段

### Requirement: Prefix configuration

系统必须支持存储键前缀。

#### Scenario: Set prefix
- **WHEN** 配置 `prefix: "app_"`
- **AND** 保存 `user` 数据
- **THEN** 实际存储键为 `"app_user"`

### Requirement: Auto persist

系统必须支持 state 自动持久化。

#### Scenario: Persist state
- **WHEN** 配置 `persist.user: { "type": "reference", "body": "{{ref_state_user}}" }`
- **AND** `user` state 发生变化
- **THEN** 系统自动保存到 localStorage

### Requirement: Restore on load

系统必须支持页面加载时恢复数据。

#### Scenario: Restore persisted state
- **WHEN** localStorage 存在已保存的 `user`
- **AND** 应用初始化
- **THEN** 系统自动恢复 `user` state

### Requirement: Cross-tab sync

系统必须支持跨标签页同步。

#### Scenario: Sync across tabs
- **WHEN** 在标签页 A 修改 `user`
- **AND** 标签页 B 打开同一应用
- **THEN** 标签页 B 的 `user` 自动更新

### Requirement: Encryption

系统必须支持敏感字段加密。

#### Scenario: Encrypt sensitive fields
- **WHEN** 配置 `encryption.fields: ["user.token"]`
- **AND** 保存 `user.token`
- **THEN** 系统加密后存储
