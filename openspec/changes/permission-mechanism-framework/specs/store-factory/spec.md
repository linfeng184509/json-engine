# store-factory

Pinia store 创建、模块化配置。

## ADDED Requirements

### Requirement: VueJsonStoreSchema structure

系统必须定义 Store Schema 类型。

#### Scenario: Store with state
- **WHEN** 定义 Store Schema
- **THEN** 包含 `id`, `state`, `getters`, `actions` 字段

### Requirement: State definition

系统必须支持响应式 state 定义。

#### Scenario: ref state
- **WHEN** 配置 `{ "type": "ref", "initial": 0 }`
- **THEN** 系统创建 `ref(0)`

#### Scenario: reactive state
- **WHEN** 配置 `{ "type": "reactive", "initial": { "name": "" } }`
- **THEN** 系统创建 `reactive({ name: '' })`

### Requirement: Getters definition

系统必须支持 getter 函数定义。

#### Scenario: Computed getter
- **WHEN** 配置 getter `{ "type": "function", "body": "{{ return state.count * 2 }}" }`
- **THEN** 系统创建 computed 属性

### Requirement: Actions definition

系统必须支持 action 函数定义。

#### Scenario: Action with params
- **WHEN** 配置 action `{ "type": "function", "params": "{{{ \"x\": \"x\" }}}", "body": "{{ state.count = x }}" }`
- **THEN** 系统创建带参数的 action

### Requirement: Module registration

系统必须支持多模块配置。

#### Scenario: Register multiple modules
- **WHEN** 配置多个 store 模块
- **THEN** 系统创建模块化 Pinia store

### Requirement: createStore function

系统必须提供 `createStore(moduleConfigs)` 函数创建 store 实例。
