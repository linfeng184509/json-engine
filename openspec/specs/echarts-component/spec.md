# echarts-component

支持通过 JSON Schema 声明 ECharts 图表组件。

## ADDED Requirements

### Requirement: Support ECharts component declaration in render

系统必须支持在 render 模板中使用 `type: 'ECharts'` 声明图表组件。

#### Scenario: Declare basic ECharts component
- **WHEN** render 中定义 `{ type: 'ECharts', props: { option: {...} } }`
- **THEN** 系统渲染 ECharts 图表组件

#### Scenario: ECharts component renders with correct container
- **WHEN** ECharts 组件被渲染
- **THEN** 系统创建包含 ref 的 DOM 容器用于 ECharts 初始化

### Requirement: Support ECharts option prop

系统必须支持通过 option prop 传递 ECharts 配置。

#### Scenario: Pass complete ECharts option
- **WHEN** option prop 传入完整的 ECharts configuration object
- **THEN** 图表使用配置正确渲染

#### Scenario: Pass option via StateRef
- **WHEN** option prop 使用 StateRef 引用 state 中的数据 `{{ref_state_chartData}}`
- **THEN** 图表使用 state 中的数据渲染

#### Scenario: Pass option via Expression
- **WHEN** option prop 使用 Expression `{{ expression }}` 动态计算配置
- **THEN** 图表使用表达式计算结果渲染

### Requirement: Support autoResize prop

系统必须支持通过 autoResize prop 启用容器大小自适应。

#### Scenario: Enable autoResize
- **WHEN** autoResize prop 设置为 true
- **THEN** 图表容器大小变化时自动调用 chart.resize()

#### Scenario: Disable autoResize
- **WHEN** autoResize prop 未设置或为 false
- **THEN** 图表不监听容器大小变化

### Requirement: Support theme prop

系统必须支持通过 theme prop 设置图表主题。

#### Scenario: Use built-in theme
- **WHEN** theme prop 设置为 "dark" 或 "light"
- **THEN** 图表使用对应的内置主题

#### Scenario: Use custom theme
- **WHEN** theme prop 传入自定义主题配置对象
- **THEN** 图表使用自定义主题渲染

### Requirement: Support loading state

系统必须支持显示加载状态。

#### Scenario: Show loading indicator
- **WHEN** loading prop 设置为 true
- **THEN** 图表显示加载动画

#### Scenario: Hide loading indicator
- **WHEN** loading prop 设置为 false 或未设置
- **THEN** 图表不显示加载动画

### Requirement: Initialize ECharts instance on mount

系统必须在组件挂载时初始化 ECharts 实例。

#### Scenario: Create chart instance
- **WHEN** 组件挂载 (onMounted)
- **THEN** 系统调用 echarts.init() 创建图表实例

#### Scenario: Handle ECharts not installed
- **WHEN** echarts 包未安装
- **THEN** 系统输出 warning 信息，不阻断应用

### Requirement: Dispose ECharts instance on unmount

系统必须在组件卸载时销毁 ECharts 实例。

#### Scenario: Clean up chart instance
- **WHEN** 组件卸载 (onUnmounted)
- **THEN** 系统调用 chart.dispose() 销毁实例

#### Scenario: Remove ResizeObserver listener
- **WHEN** 组件卸载且启用了 autoResize
- **THEN** 系统调用 ResizeObserver.disconnect() 移除监听

### Requirement: Support v-bind directive

系统必须支持在 ECharts 组件上使用 v-bind 指令。

#### Scenario: Bind dynamic props
- **WHEN** 使用 v-bind 动态绑定 props
- **THEN** 系统正确解析并应用绑定的值
