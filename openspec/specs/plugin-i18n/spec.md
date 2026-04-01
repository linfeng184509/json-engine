# plugin-i18n

国际化插件，提供 `_i18n` Scope。

## ADDED Requirements

### Requirement: Register i18n plugin

系统必须支持注册 i18n 插件。

#### Scenario: Plugin declaration
- **WHEN** Schema 中声明 `{ name: "@json-engine/plugin-i18n" }`
- **THEN** 系统加载并初始化 i18n 插件

### Requirement: Provide _i18n scope

插件必须提供 `_i18n` Scope 扩展。

#### Scenario: Translate key
- **WHEN** 调用 `$_core_i18n.t("common.save")`
- **THEN** 返回翻译后的文本

#### Scenario: Translate with params
- **WHEN** 调用 `$_core_i18n.t("user.greeting", { name: "John" })`
- **THEN** 返回填充参数后的文本

#### Scenario: Get current locale
- **WHEN** 访问 `$_core_i18n.locale`
- **THEN** 返回当前语言

#### Scenario: Set locale
- **WHEN** 调用 `$_core_i18n.setLocale("en-US")`
- **THEN** 切换语言

### Requirement: Support i18n config

插件必须支持国际化配置。

#### Scenario: Configure default locale
- **WHEN** 配置 `{ i18n: { locale: "zh-CN" } }`
- **THEN** 默认使用中文

#### Scenario: Configure fallback locale
- **WHEN** 配置 `{ i18n: { fallbackLocale: "en-US" } }`
- **THEN** 翻译缺失时使用回退语言

#### Scenario: Configure messages
- **WHEN** 配置 `{ i18n: { messages: { "zh-CN": { common: { save: "保存" } } } } }`
- **THEN** 加载翻译消息

### Requirement: Support i18n value type

插件必须支持 `{ type: 'i18n', key: '...' }` 值类型。

#### Scenario: Parse i18n value
- **WHEN** 解析 `{ type: 'i18n', key: 'common.save' }`
- **THEN** 返回 `{ _type: 'i18n', key: 'common.save' }`

#### Scenario: Resolve i18n at runtime
- **WHEN** 运行时解析 `_type: 'i18n'` 值
- **THEN** 返回翻译后的文本