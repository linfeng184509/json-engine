# echarts-reactive-update

支持响应式更新，当绑定的数据变化时自动调用 setOption 更新图表。

## ADDED Requirements

### Requirement: Watch option prop changes

系统必须监听 option prop 的变化并自动更新图表。

#### Scenario: Update chart on state change
- **WHEN** option 引用的 state 数据发生变化
- **THEN** 系统自动调用 chart.setOption() 更新图表

#### Scenario: Deep watch nested option changes
- **WHEN** option 配置中的嵌套对象属性变化（如 series[0].data[0]）
- **THEN** 系统检测到变化并更新图表

### Requirement: Debounce rapid updates

系统必须对频繁的更新进行防抖处理。

#### Scenario: Debounce multiple changes
- **WHEN** state 在短时间内连续变化多次
- **THEN** 系统只在最后一次变化后更新一次图表，延迟 300ms

#### Scenario: Immediate update for non-debounced changes
- **WHEN** 两次变化间隔超过 300ms
- **THEN** 系统立即更新图表

### Requirement: Support setOption merge mode

系统必须使用 ECharts 的 merge 模式更新图表。

#### Scenario: Merge option updates
- **WHEN** 调用 setOption 更新部分配置
- **THEN** 使用 notMerge=false，保留未变化的配置

#### Scenario: Replace entire option
- **WHEN** 需要完全替换配置时
- **THEN** 提供方式支持 notMerge=true

### Requirement: Handle update errors gracefully

系统必须优雅处理更新错误。

#### Scenario: Handle invalid option on update
- **WHEN** 更新时传入无效的 option 配置
- **THEN** 系统捕获错误，输出 warning，不阻断应用

#### Scenario: Handle disposed chart
- **WHEN** 图表已销毁但仍有更新触发
- **THEN** 系统忽略更新，不抛出错误

### Requirement: Unwatch on component unmount

系统必须在组件卸载时清理监听器。

#### Scenario: Stop watching on unmount
- **WHEN** 组件卸载
- **THEN** 系统停止所有 watch 监听器
