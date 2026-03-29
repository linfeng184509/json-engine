# ui-integration

UI 组件库集成、全局注册、主题配置。

## ADDED Requirements

### Requirement: UIConfig structure

系统必须定义 UI 配置类型。

#### Scenario: Basic UI config
- **WHEN** 配置 UI 设置
- **THEN** 包含 `library`, `theme`, `components` 字段

### Requirement: Library selection

系统必须支持选择 UI 组件库。

#### Scenario: Select ant-design-vue
- **WHEN** 配置 `"library": "ant-design-vue"`
- **THEN** 系统加载并注册 ant-design-vue

#### Scenario: Select element-plus
- **WHEN** 配置 `"library": "element-plus"`
- **THEN** 系统加载并注册 element-plus

### Requirement: Theme configuration

系统必须支持主题配置。

#### Scenario: Custom primary color
- **WHEN** 配置 `theme.primaryColor: "#1890ff"`
- **THEN** 系统应用主题色到 UI 组件

### Requirement: Component registration

系统必须支持组件全局注册。

#### Scenario: Global components
- **WHEN** 配置 `"global": ["Button", "Input", "Select"]`
- **THEN** 系统自动注册这些组件为全局组件

#### Scenario: Lazy components
- **WHEN** 配置 `"lazy": ["DatePicker", "Tree"]`
- **THEN** 系统按需异步加载这些组件

### Requirement: Global properties

系统必须注入 UI 服务到全局属性。

#### Scenario: Inject $message
- **WHEN** 使用 ant-design-vue
- **THEN** 系统注入 `app.config.globalProperties.$message`

#### Scenario: Inject $notification
- **WHEN** 使用 ant-design-vue
- **THEN** 系统注入 `app.config.globalProperties.$notification`
