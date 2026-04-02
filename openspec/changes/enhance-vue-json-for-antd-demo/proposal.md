## Why

当前 vue-json 缺失关键能力，导致约 50% 的 ant-design-vue 组件 demo 无法正确转换为 JSON Schema：
1. **v-model 带参数**：只支持 `modelValue`，不支持 `v-model:open`、`v-model:checked`、`v-model:value` 等 antd 常用模式
2. **Icon 组件**：plugin-antd 未注册 `@ant-design/icons-vue`，图标无法在 JSON Schema 中使用
3. **插槽渲染**：`applyVSlot` 已定义但未在 `render-factory` 中调用，无法渲染具名插槽（如 Table 的 bodyCell）
4. **高级 API**：`Modal.useModal()`、`Form.useForm()` 等 antd 静态方法无法在 JSON 中表达

解决这些问题将使 vue-json 能够完整支持 antd 组件体系，为创建 antd-demo-playground 项目奠定基础。

## What Changes

- **v-model 指令扩展**：支持带参数的 v-model（如 `v-model:open`、`v-model:checked`）
- **Icon 组件注册**：在 plugin-antd 中注册所有 @ant-design/icons-vue 图标组件
- **vSlot 渲染集成**：在 render-factory.ts 中调用 applyVSlot，支持具名插槽和 slot props
- **高级 API scope**：扩展 `_antd` scope，提供 Modal.confirm、Form.useForm 等 API
- **类型定义更新**：更新 VNodeDirectives 类型，添加 vModel arg 和 event 字段

## Capabilities

### New Capabilities

- `v-model-args`: 支持 v-model 带参数绑定（v-model:open, v-model:checked, v-model:value 等）
- `antd-icons`: 注册 @ant-design/icons-vue 所有图标为全局组件
- `slot-render`: 具名插槽渲染和 slot props 传递
- `antd-api-scope`: antd 高级 API（Modal.confirm、Form.useForm）在 JSON Schema 中调用

### Modified Capabilities

- `v-model-directive`: 扩展 vModel 指令定义，支持自定义 prop 名和 event 名
- `antd-plugin-components`: 扩展 plugin-antd 组件注册范围，包含图标组件

## Impact

**代码影响**：
- `src/packages/vue-json/src/types/schema.ts`：VNodeDirectives 类型扩展
- `src/packages/vue-json/src/runtime/directive-runtime.ts`：applyVModel 逻辑修改
- `src/packages/vue-json/src/runtime/render-factory.ts`：vSlot 集成
- `src/packages/plugins/plugin-antd/src/plugin.ts`：图标注册 + scope 扩展
- `src/packages/plugins/plugin-antd/src/iconComponents.ts`：新增文件

**测试影响**：
- 需新增 v-model 带参数测试
- 需新增插槽渲染测试
- 需验证 Icon 组件加载

**依赖影响**：
- plugin-antd 需依赖 `@ant-design/icons-vue`（已安装）

**向后兼容**：
- 所有变更向后兼容，不影响现有 `modelValue` 默认行为