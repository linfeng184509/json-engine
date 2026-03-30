# plugin-echarts

ECharts 图表插件。

## ADDED Requirements

### Requirement: Register echarts plugin

系统必须支持注册 echarts 插件。

#### Scenario: Plugin declaration
- **WHEN** Schema 中声明 `{ name: "@json-engine/plugin-echarts" }`
- **THEN** 系统加载并初始化 echarts 插件

### Requirement: Register ECharts component

插件必须注册 ECharts Vue 组件。

#### Scenario: Use ECharts component
- **WHEN** render 中使用 `{ type: 'ECharts', props: { option: {...} } }`
- **THEN** 渲染 ECharts 图表

### Requirement: Support echarts-option value type

插件必须支持 `{ type: 'echarts-option', body: {...} }` 值类型。

#### Scenario: Parse echarts-option
- **WHEN** 解析 `{ type: 'echarts-option', body: { xAxis: {...}, series: [...] } }`
- **THEN** 返回 `{ _type: 'echarts-option', option: {...} }`

#### Scenario: Resolve expressions in option
- **WHEN** option 中包含 `{{ref_state_data}}`
- **THEN** 运行时解析为实际数据

### Requirement: Support echarts config

插件必须支持 ECharts 配置。

#### Scenario: Configure theme
- **WHEN** 配置 `{ echarts: { theme: "dark" } }`
- **THEN** 图表使用暗色主题

#### Scenario: Configure autoResize
- **WHEN** 配置 `{ echarts: { autoResize: true } }`
- **THEN** 图表自动适应容器大小

### Requirement: Support component props

ECharts 组件必须支持相关 props。

#### Scenario: Pass option prop
- **WHEN** 组件接收 `option` prop
- **THEN** 图表使用该配置渲染

#### Scenario: Pass autoResize prop
- **WHEN** 组件接收 `autoResize: true`
- **THEN** 图表监听容器大小变化

#### Scenario: Pass loading prop
- **WHEN** 组件接收 `loading: true`
- **THEN** 图表显示加载动画