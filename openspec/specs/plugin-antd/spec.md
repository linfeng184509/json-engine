# plugin-antd

Ant Design Vue 组件插件。

## ADDED Requirements

### Requirement: Register antd plugin

系统必须支持注册 antd 插件。

#### Scenario: Plugin declaration
- **WHEN** Schema 中声明 `{ name: "@json-engine/plugin-antd" }`
- **THEN** 系统加载并初始化 antd 插件

### Requirement: Register antd components

插件必须注册 Ant Design Vue 组件。

#### Scenario: Use AButton
- **WHEN** render 中使用 `{ type: 'AButton', props: { type: 'primary' } }`
- **THEN** 渲染 Ant Design Button 组件

#### Scenario: Use ATable
- **WHEN** render 中使用 `{ type: 'ATable', props: { dataSource: [...], columns: [...] } }`
- **THEN** 渲染 Ant Design Table 组件

#### Scenario: Use AForm
- **WHEN** render 中使用 `{ type: 'AForm', props: { model: {...} } }`
- **THEN** 渲染 Ant Design Form 组件

### Requirement: Support theme config

插件必须支持主题配置。

#### Scenario: Configure primary color
- **WHEN** 配置 `{ antd: { theme: { primaryColor: "#1677ff" } } }`
- **THEN** 应用主题色

#### Scenario: Configure border radius
- **WHEN** 配置 `{ antd: { theme: { borderRadius: 6 } } }`
- **THEN** 设置圆角大小

### Requirement: Support locale

插件必须支持国际化。

#### Scenario: Configure locale
- **WHEN** 配置 `{ antd: { locale: "zh_CN" } }`
- **THEN** 组件使用中文语言包