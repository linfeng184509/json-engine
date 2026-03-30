# echarts-option-parser

支持在 JSON 中定义 ECharts 配置对象，支持表达式引用。

## ADDED Requirements

### Requirement: Parse echarts-option type values

系统必须支持解析 `type: 'echarts-option'` 类型的值。

#### Scenario: Parse static option object
- **WHEN** schema 中定义 `{ type: 'echarts-option', body: { xAxis: {...}, series: [...] } }`
- **THEN** 解析器返回包含 option 配置的对象，标记 `_type: 'echarts-option'`

#### Scenario: Parse option with expressions
- **WHEN** option body 中包含表达式 `{{ref_state_xxx}}`
- **THEN** 解析器正确保留表达式结构，待运行时解析

### Requirement: Register EChartsOptionParser

系统必须在 vue-parser-config 中注册 EChartsOptionParser。

#### Scenario: Parser registered by default
- **WHEN** 使用默认配置调用 parseSchema
- **THEN** EChartsOptionParser 已注册并可用

#### Scenario: Parser handles nested objects
- **WHEN** option body 包含嵌套对象和数组
- **THEN** 解析器递归处理所有层级

### Requirement: Support expression references in option

系统必须支持在 option 配置中使用表达式引用。

#### Scenario: Reference state in series data
- **WHEN** series.data 使用 `{{ref_state_salesData}}`
- **THEN** 运行时解析为实际的 state 值

#### Scenario: Reference computed in axis config
- **WHEN** xAxis.categories 使用 `{{ref_computed_categoryList}}`
- **THEN** 运行时解析为 computed 的值

#### Scenario: Reference props in title
- **WHEN** title.text 使用 `{{ref_props_chartTitle}}`
- **THEN** 运行时解析为 props 的值

### Requirement: Validate option structure

系统必须验证 option 配置的基本结构。

#### Scenario: Validate required fields
- **WHEN** option 缺少必要字段（如 xAxis 或 series）
- **THEN** 系统输出 warning，但不阻断渲染（ECharts 有默认值）

#### Scenario: Invalid option type
- **WHEN** option 不是对象类型
- **THEN** 系统抛出 ValidationError
