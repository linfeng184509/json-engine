# parsejson-integration

parseSchema 入口完全集成 parseJson，自动解析所有结构化值类型。

## ADDED Requirements

### Requirement: Use parseJson as Schema preprocessing

系统必须在 parseSchema 入口调用 parseJson 预处理整个 Schema。

#### Scenario: Preprocess object input
- **WHEN** parseSchema 接收对象输入
- **THEN** 系统调用 parseJson 预处理，返回解析后的 Schema

#### Scenario: Preprocess string input
- **WHEN** parseSchema 接收 JSON 字符串输入
- **THEN** 系统先 JSON.parse 再调用 parseJson 预处理

#### Scenario: Preserve parseJson errors
- **WHEN** parseJson 解析失败
- **THEN** 系统返回包含错误路径和原因的 ParseResult

### Requirement: Auto-convert ExpressionValue

parseJson 必须自动识别并解析 `{ type: 'expression' }` 结构。

#### Scenario: Parse expression in props
- **WHEN** Schema 中 props 值为 `{ type: 'expression', body: '{{ref_state_count}}' }`
- **THEN** parseJson 返回解析后的 ExpressionParseData

#### Scenario: Parse expression in children
- **WHEN** VNode children 为 `{ type: 'expression', body: '{{ref_state_message}}' }`
- **THEN** parseJson 返回解析后的 ExpressionParseData

### Requirement: Auto-convert FunctionValue

parseJson 必须自动识别并解析 `{ type: 'function' }` 结构。

#### Scenario: Parse function in methods
- **WHEN** Schema 中 method 为 `{ type: 'function', params: '', body: 'state.count.value++' }`
- **THEN** parseJson 返回解析后的 FunctionParseData

#### Scenario: Reject function with empty params
- **WHEN** function params 为空
- **THEN** parseJson 抛出验证错误

### Requirement: Auto-convert StateRef and PropsRef

parseJson 必须自动识别并解析 state 和 props 引用结构。

#### Scenario: Parse state reference
- **WHEN** 值为 `{ type: 'state', variable: 'count' }`
- **THEN** parseJson 返回 VariableParseData

#### Scenario: Parse props reference
- **WHEN** 值为 `{ type: 'props', variable: 'title' }`
- **THEN** parseJson 返回 VariableParseData

### Requirement: Support KeyParser for component names

系统必须注册默认 KeyParser 处理组件名转换。

#### Scenario: Register component-name KeyParser
- **WHEN** parseSchema 初始化
- **THEN** 系统注册 component-name KeyParser

#### Scenario: Transform kebab-case component names
- **WHEN** Schema 中组件名为 `my-component`
- **THEN** KeyParser 转换为 `MyComponent`

### Requirement: Provide parsed Schema to runtime

parseSchema 必须返回可直接用于运行时的解析后 Schema。

#### Scenario: Runtime uses parsed data directly
- **WHEN** createComponent 接收解析后的 Schema
- **THEN** 运行时直接使用结构化值，无需再次解析