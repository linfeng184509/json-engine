# app-schema

应用入口 Schema，支持多文件引用和组织。

## ADDED Requirements

### Requirement: VueJsonAppSchema structure

系统必须定义 VueJsonAppSchema 类型。

#### Scenario: Basic app schema
- **WHEN** 定义应用 Schema
- **THEN** 包含 `name`, `version`, `root`, `plugins`, `ui`, `network`, `storage`, `auth` 等字段

### Requirement: Multi-file references

系统必须支持 Schema 文件引用。

#### Scenario: Reference component schema
- **WHEN** 配置 `"root": "./components/App.json"`
- **THEN** 系统加载并解析该文件

#### Scenario: Reference router config
- **WHEN** 配置 `"router": "./router.json"`
- **THEN** 系统加载并解析路由配置

#### Scenario: Reference store modules
- **WHEN** 配置 store 模块路径
- **THEN** 系统加载并创建 Pinia store

### Requirement: Schema loading

系统必须提供 Schema 加载机制。

#### Scenario: Load remote schema
- **WHEN** 调用 `loadSchema('https://example.com/app.json')`
- **THEN** 系统获取并解析远程 Schema

#### Scenario: Cache loaded schema
- **WHEN** 多次加载同一 Schema
- **THEN** 系统缓存结果避免重复请求

### Requirement: Schema validation

系统必须在加载前验证 Schema 结构。

#### Scenario: Validate required fields
- **WHEN** Schema 缺少 `name` 或 `root`
- **THEN** 系统抛出 SchemaValidationError
