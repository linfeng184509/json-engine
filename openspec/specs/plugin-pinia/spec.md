# plugin-pinia

Pinia 状态管理插件。

## ADDED Requirements

### Requirement: Register pinia plugin

系统必须支持注册 pinia 插件。

#### Scenario: Plugin declaration
- **WHEN** Schema 中声明 `{ name: "@json-engine/plugin-pinia" }`
- **THEN** 系统加载并初始化 pinia 插件

### Requirement: Support store definition in schema

插件必须支持在 Schema 中定义 store。

#### Scenario: Define store with state
- **WHEN** Schema 定义 `stores: { user: { state: { name: "test" } } }`
- **THEN** 创建 user store

#### Scenario: Define store with getters
- **WHEN** Schema 定义 store getters
- **THEN** 创建对应的计算属性

#### Scenario: Define store with actions
- **WHEN** Schema 定义 store actions
- **THEN** 创建对应的方法

### Requirement: Support pinia config

插件必须支持 Pinia 配置。

#### Scenario: Configure persist
- **WHEN** 配置 `{ pinia: { persist: true } }`
- **THEN** store 状态持久化到存储

#### Scenario: Configure storage type
- **WHEN** 配置 `{ pinia: { storage: "sessionStorage" } }`
- **THEN** 使用 sessionStorage 持久化

### Requirement: Integrate with plugin-storage

插件应与 plugin-storage 集成。

#### Scenario: Use storage plugin
- **WHEN** plugin-storage 已安装
- **THEN** pinia 可使用其存储功能