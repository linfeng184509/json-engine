# i18n-factory

国际化配置、语言包加载、动态切换。

## ADDED Requirements

### Requirement: I18nConfig structure

系统必须定义国际化配置类型。

#### Scenario: Basic i18n config
- **WHEN** 配置国际化
- **THEN** 包含 `locale`, `fallbackLocale`, `messages` 字段

### Requirement: Locale configuration

系统必须支持初始语言和回退语言配置。

#### Scenario: Set initial locale
- **WHEN** 配置 `locale: "zh-CN"`
- **THEN** 系统使用中文作为初始语言

#### Scenario: Set fallback locale
- **WHEN** 配置 `fallbackLocale: "en-US"`
- **AND** 翻译键不存在
- **THEN** 系统回退到英语

### Requirement: Inline messages

系统必须支持内联消息定义。

#### Scenario: Inline message definition
- **WHEN** 配置 `messages.zh-CN.common.save: "保存"`
- **THEN** 系统加载内联消息

### Requirement: External message files

系统必须支持外部语言包文件。

#### Scenario: Load external file
- **WHEN** 配置 `externalFiles.zh-CN: "./locales/zh-CN.json"`
- **THEN** 系统加载并合并外部语言包

### Requirement: Dynamic locale switch

系统必须支持运行时语言切换。

#### Scenario: Switch locale
- **WHEN** 调用 `i18n.setLocale('en-US')`
- **THEN** 系统切换到英语
- **AND** 所有翻译自动更新

### Requirement: Core Scope integration

系统必须在 Core Scope 中暴露 i18n 方法。

#### Scenario: Access via Core Scope
- **WHEN** 在表达式中调用 `$_[core]_i18n.t('common.save')`
- **THEN** 返回当前语言的翻译文本
