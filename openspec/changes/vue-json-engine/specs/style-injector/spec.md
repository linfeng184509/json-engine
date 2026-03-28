# style-injector

运行时样式注入能力，支持动态样式和 scoped CSS。

## ADDED Requirements

### Requirement: Inject styles at runtime

系统必须能够在运行时注入样式到文档。

#### Scenario: Inject style element
- **WHEN** schema.styles.css 定义了样式内容
- **THEN** 系统创建 `<style>` 元素并插入到 document.head

#### Scenario: Avoid duplicate injection
- **WHEN** 同一组件多次渲染
- **THEN** 系统仅注入一次样式，不创建重复的 style 元素

### Requirement: Support scoped CSS

系统必须支持 scoped CSS，为组件生成唯一属性选择器。

#### Scenario: Apply scoped attribute
- **WHEN** schema.styles.scoped 为 true
- **THEN** 系统为组件根元素添加 `data-v-<componentId>` 属性

#### Scenario: Transform CSS selectors
- **WHEN** scoped 样式包含选择器
- **THEN** 系统为选择器添加 `[data-v-<componentId>]` 后缀

#### Scenario: Handle pseudo selectors
- **WHEN** scoped 样式包含伪类选择器（如 :hover）
- **THEN** 系统正确处理，在选择器正确位置添加 scoped 属性

### Requirement: Support dynamic styles

系统必须支持动态样式更新。

#### Scenario: Update styles on schema change
- **WHEN** 组件 schema 更新导致样式变化
- **THEN** 系统更新已注入的样式内容

#### Scenario: Remove styles on component destroy
- **WHEN** 组件被销毁
- **THEN** 系统移除对应的 style 元素（可通过配置禁用）

### Requirement: Support CSS variables

系统必须支持 CSS 变量。

#### Scenario: Use CSS variables in styles
- **WHEN** 样式中使用 CSS 变量（如 `var(--primary-color)`）
- **THEN** 系统保留变量引用，不做转换

#### Scenario: Set CSS variables dynamically
- **WHEN** 组件需要动态设置 CSS 变量
- **THEN** 系统在组件根元素上设置 style 属性

### Requirement: Generate unique component ID

系统必须为每个组件生成唯一标识符。

#### Scenario: Generate ID from component name
- **WHEN** 组件名为 "MyComponent"
- **THEN** 系统生成类似 `my-component-abc123` 的唯一 ID

#### Scenario: Ensure ID uniqueness
- **WHEN** 存在同名组件
- **THEN** 系统生成不同的唯一 ID

### Requirement: Support style isolation options

系统必须支持样式隔离配置。

#### Scenario: Enable style isolation
- **WHEN** 配置 styleIsolation: true
- **THEN** 系统为组件创建独立的 style 容器

#### Scenario: Disable style injection
- **WHEN** 配置 injectStyles: false
- **THEN** 系统不自动注入样式，由用户手动处理