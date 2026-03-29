# directive-runtime (delta)

模板指令运行时实现能力 - 使用结构化值类型。

## MODIFIED Requirements

### Requirement: Support v-if with ExpressionValue

系统必须支持 v-if 指令使用 ExpressionValue。

#### Scenario: Evaluate v-if ExpressionValue
- **WHEN** vIf 为 `{ type: 'expression', body: '{{ref_state_isVisible}}' }`
- **THEN** 系统求值表达式，决定是否渲染

### Requirement: Support v-show with ExpressionValue

系统必须支持 v-show 指令使用 ExpressionValue。

#### Scenario: Evaluate v-show ExpressionValue
- **WHEN** vShow 为 `{ type: 'expression', body: '{{ref_state_isShown}}' }`
- **THEN** 系统求值表达式，控制 display 样式

### Requirement: Support v-for with ExpressionValue source

系统必须支持 v-for 指令使用 ExpressionValue 作为数据源。

#### Scenario: Iterate v-for source
- **WHEN** vFor.source 为 `{ type: 'expression', body: '{{ref_state_items}}' }`
- **THEN** 系统求值表达式，遍历结果渲染列表

### Requirement: Support v-model with StateRef or PropsRef

系统必须支持 v-model 指令使用结构化引用。

#### Scenario: Bind v-model to StateRef
- **WHEN** vModel.prop 为 `{ type: 'state', variable: 'inputValue' }`
- **THEN** 系统创建双向绑定到 state.inputValue

#### Scenario: Reject v-model with ExpressionValue
- **WHEN** vModel.prop 为 `{ type: 'expression', body: '...' }`
- **THEN** 系统抛出错误，vModel.prop 必须是引用类型

### Requirement: Support v-bind with ExpressionValue

系统必须支持 v-bind 指令使用 ExpressionValue。

#### Scenario: Bind attribute with ExpressionValue
- **WHEN** vBind.class 为 `{ type: 'expression', body: '{{ref_state_isActive ? "active" : ""}}' }`
- **THEN** 系统求值表达式并绑定

### Requirement: Support v-on with FunctionValue

系统必须支持 v-on 指令使用 FunctionValue 作为事件处理器。

#### Scenario: Bind event with FunctionValue
- **WHEN** vOn.click 为 `{ type: 'function', params: '', body: 'methods.handleClick()' }`
- **THEN** 系统创建事件处理函数

#### Scenario: FunctionValue receives event parameter
- **WHEN** FunctionValue.params 包含 `event`
- **THEN** 事件对象作为参数传入函数

### Requirement: Support v-html and v-text with ExpressionValue

系统必须支持 v-html 和 v-text 指令使用 ExpressionValue。

#### Scenario: Render v-html with ExpressionValue
- **WHEN** vHtml 为 `{ type: 'expression', body: '{{ref_state_rawHtml}}' }`
- **THEN** 系统求值并设置 innerHTML

## REMOVED Requirements

### Requirement: Support legacy directive string format

**Reason**: 完全迁移到结构化值类型

**Migration**:
- `vIf: "ref_state_isVisible"` → `vIf: { type: 'expression', body: '{{ref_state_isVisible}}' }`
- `vOn: { click: "methods.handleClick()" }` → `vOn: { click: { type: 'function', params: '', body: 'methods.handleClick()' } }`