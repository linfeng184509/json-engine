# directive-runtime

模板指令运行时实现能力，支持 Vue 模板指令。

## ADDED Requirements

### Requirement: Support v-if / v-else-if / v-else

系统必须支持条件渲染指令。

#### Scenario: Render with v-if true
- **WHEN** `vIf: "state.isVisible"` 且 state.isVisible 为 true
- **THEN** 系统渲染该元素

#### Scenario: Skip with v-if false
- **WHEN** `vIf: "state.isVisible"` 且 state.isVisible 为 false
- **THEN** 系统不渲染该元素

#### Scenario: Render with v-else-if
- **WHEN** v-if 条件为 false 且 v-else-if 条件为 true
- **THEN** 系统渲染 v-else-if 分支的元素

#### Scenario: Render with v-else
- **WHEN** v-if 和 v-else-if 条件都为 false
- **THEN** 系统渲染 v-else 分支的元素

### Requirement: Support v-show

系统必须支持 v-show 指令控制元素显示。

#### Scenario: Show element with v-show true
- **WHEN** `vShow: "state.isShown"` 且值为 true
- **THEN** 系统渲染元素，不添加 display:none

#### Scenario: Hide element with v-show false
- **WHEN** `vShow: "state.isShown"` 且值为 false
- **THEN** 系统渲染元素，添加 style="display:none"

### Requirement: Support v-for

系统必须支持列表渲染指令。

#### Scenario: Render list with v-for
- **WHEN** `vFor: { source: "state.items", alias: "item" }`
- **THEN** 系统为每个 item 渲染一个元素副本

#### Scenario: Render list with index
- **WHEN** `vFor: { source: "state.items", alias: "item", index: "i" }`
- **THEN** 系统提供 index 变量供表达式使用

#### Scenario: Render object entries
- **WHEN** v-for source 为对象
- **THEN** 系统遍历对象的键值对

### Requirement: Support v-model

系统必须支持双向绑定指令。

#### Scenario: Bind v-model to ref
- **WHEN** `vModel: { prop: "state.inputValue" }`
- **THEN** 系统创建双向绑定，input 事件更新 state.inputValue

#### Scenario: Support v-model modifiers
- **WHEN** `vModel: { prop: "state.text", modifiers: ["trim", "number"] }`
- **THEN** 系统在更新前应用修饰符处理

#### Scenario: Support v-model on custom component
- **WHEN** v-model 用于自定义组件
- **THEN** 系统绑定 modelValue prop 和 update:modelValue 事件

### Requirement: Support v-bind

系统必须支持属性绑定指令。

#### Scenario: Bind single attribute
- **WHEN** `vBind: { class: "state.dynamicClass" }`
- **THEN** 系统求值表达式并绑定到 class 属性

#### Scenario: Bind multiple attributes
- **WHEN** vBind 包含多个属性
- **THEN** 系统绑定所有属性

#### Scenario: Support v-bind shorthand
- **WHEN** props 中使用 `:class` 语法
- **THEN** 系统识别为 v-bind

### Requirement: Support v-on

系统必须支持事件监听指令。

#### Scenario: Bind event handler
- **WHEN** `vOn: { click: "methods.handleClick" }`
- **THEN** 系统绑定 click 事件处理函数

#### Scenario: Support event modifiers
- **WHEN** `vOn: { "click.stop": "methods.handleClick" }`
- **THEN** 系统自动调用 event.stopPropagation()

#### Scenario: Support key modifiers
- **WHEN** `vOn: { "keyup.enter": "methods.handleSubmit" }`
- **THEN** 系统仅在 Enter 键时触发处理函数

### Requirement: Support v-slot

系统必须支持插槽指令。

#### Scenario: Provide default slot
- **WHEN** 组件有 children
- **THEN** 系统将 children 作为默认插槽传递

#### Scenario: Provide named slot
- **WHEN** `vSlot: { name: "header" }`
- **THEN** 系统将内容传递给具名插槽

#### Scenario: Provide scoped slot
- **WHEN** `vSlot: { props: ["item", "index"] }`
- **THEN** 系统创建作用域插槽，提供插槽 props

### Requirement: Support v-html and v-text

系统必须支持 v-html 和 v-text 指令。

#### Scenario: Render v-html
- **WHEN** `vHtml: "state.rawHtml"`
- **THEN** 系统设置 innerHTML 为求值结果

#### Scenario: Render v-text
- **WHEN** `vText: "state.message"`
- **THEN** 系统设置 textContent 为求值结果

### Requirement: Support v-once

系统必须支持 v-once 指令。

#### Scenario: Render once
- **WHEN** `vOnce: true`
- **THEN** 系统仅渲染一次，后续更新跳过该元素