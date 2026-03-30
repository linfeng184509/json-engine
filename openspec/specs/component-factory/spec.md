# component-factory

组件工厂能力，支持创建和管理 Vue 组件。

## MODIFIED Requirements

### Requirement: Support runtime dynamic component registration

系统必须支持运行时动态注册组件到全局。

**Original behavior:**
系统仅支持在 schema 的 components 字段中定义本地组件或异步组件。

**Modified behavior:**
系统新增 `registerComponents` API，支持在应用启动时注册全局组件（如 ECharts 组件）。注册的组件可以在任何 schema 的 render 中使用。

#### Scenario: Register ECharts component globally
- **WHEN** 调用 `registerComponents([{ name: 'ECharts', component: EChartsComponent }])`
- **THEN** 系统在全局组件列表中注册 ECharts 组件

#### Scenario: Use globally registered component in schema
- **WHEN** schema render 中使用 `type: 'ECharts'`
- **THEN** 系统从全局组件列表中找到并渲染该组件

#### Scenario: Auto-register ECharts on plugin install
- **WHEN** vue-json 插件安装且检测到 echarts 包已安装
- **THEN** 系统自动注册 ECharts 组件，无需手动调用 registerComponents
