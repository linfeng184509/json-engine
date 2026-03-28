# directive-runtime (delta)

模板指令运行时实现能力 - core-engine 表达式格式变更。

## MODIFIED Requirements

### Requirement: Support v-if / v-else-if / v-else

系统必须支持条件渲染指令，使用 core-engine 格式表达式。

#### Scenario: Render with v-if true
- **WHEN** `vIf: "{{ref_state_isVisible}}"` 且 state.isVisible 为 true
- **THEN** 系统渲染该元素

#### Scenario: Skip with v-if false
- **WHEN** `vIf: "{{ref_state_isVisible}}"` 且 state.isVisible 为 false
- **THEN** 系统不渲染该元素

### Requirement: Support v-show

系统必须支持 v-show 指令控制元素显示，使用 core-engine 格式表达式。

#### Scenario: Show element with v-show true
- **WHEN** `vShow: "{{ref_state_isShown}}"` 且值为 true
- **THEN** 系统渲染元素，不添加 display:none

#### Scenario: Hide element with v-show false
- **WHEN** `vShow: "{{ref_state_isShown}}"` 且值为 false
- **THEN** 系统渲染元素，添加 style="display:none"

### Requirement: Support v-for

系统必须支持列表渲染指令，使用 core-engine 格式表达式。

#### Scenario: Render list with v-for
- **WHEN** `vFor: { source: "{{ref_state_items}}", alias: "item" }`
- **THEN** 系统为每个 item 渲染一个元素副本

#### Scenario: Render list with index
- **WHEN** `vFor: { source: "{{ref_state_items}}", alias: "item", index: "i" }`
- **THEN** 系统提供 index 变量供表达式使用

### Requirement: Support v-model

系统必须支持双向绑定指令，使用 core-engine 格式表达式。

#### Scenario: Bind v-model to ref
- **WHEN** `vModel: { prop: "{{ref_state_inputValue}}" }`
- **THEN** 系统创建双向绑定，input 事件更新 state.inputValue

#### Scenario: Resolve v-model reference
- **WHEN** v-model prop 为 core-engine 格式引用
- **THEN** 系统使用 parseNestedReference 解析并找到对应 state 变量更新

### Requirement: Support v-bind

系统必须支持属性绑定指令，使用 core-engine 格式表达式。

#### Scenario: Bind single attribute
- **WHEN** `vBind: { class: "{{ref_state_dynamicClass}}" }`
- **THEN** 系统求值表达式并绑定到 class 属性

### Requirement: Support v-on

系统必须支持事件监听指令。

#### Scenario: Bind event handler
- **WHEN** `vOn: { click: "methods.handleClick" }`
- **THEN** 系统绑定 click 事件处理函数

### Requirement: Support v-html and v-text

系统必须支持 v-html 和 v-text 指令，使用 core-engine 格式表达式。

#### Scenario: Render v-html
- **WHEN** `vHtml: "{{ref_state_rawHtml}}"`
- **THEN** 系统设置 innerHTML 为求值结果

#### Scenario: Render v-text
- **WHEN** `vText: "{{ref_state_message}}"`
- **THEN** 系统设置 textContent 为求值结果

## REMOVED Requirements

### Requirement: Support legacy directive expression format

**Reason**: 指令表达式统一为 core-engine 格式

**Migration**: 用户需将指令中的表达式改为：
- `vIf: "state.isVisible"` → `vIf: "{{ref_state_isVisible}}"`
- `vFor: { source: "state.items" }` → `vFor: { source: "{{ref_state_items}}" }`