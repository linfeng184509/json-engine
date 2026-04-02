## 1. v-model 带参数支持 (P0)

- [x] 1.1 扩展 VNodeDirectives 类型定义，在 vModel 中添加 `arg?: string` 和 `event?: string` 字段
- [x] 1.2 修改 applyVModel 函数逻辑，支持根据 arg 字段推导 prop 名和 event 名
- [x] 1.3 实现 v-model 默认行为保持兼容（arg 未定义时使用 modelValue）
- [x] 1.4 添加 v-model:open 测试用例（Modal basic demo 验证）
- [x] 1.5 添加 v-model:checked 测试用例（Checkbox demo 验证）
- [x] 1.6 添加 v-model:value 测试用例（Input/Form demo 验证）

## 2. Icon 组件注册 (P0)

- [x] 2.1 创建 plugin-antd/src/iconComponents.ts 文件
- [x] 2.2 实现 getAntdIconComponents 函数，导出所有 @ant-design/icons-vue 图标
- [x] 2.3 修改 plugin-antd/src/types.ts，添加 includeIcons 配置项类型
- [x] 2.4 修改 plugin-antd/src/plugin.ts onInstall，根据 includeIcons 配置注册图标
- [x] 2.5 添加图标组件注册测试用例
- [x] 2.6 验证 Icon basic demo 可正确转换和渲染

## 3. vSlot 渲染集成 (P1)

- [x] 3.1 在 render-factory.ts 中集成 applyVSlot 调用逻辑
- [x] 3.2 实现具名插槽渲染（根据 vSlot.name 渲染到对应 slot）
- [x] 3.3 实现 slot props 传递（将 slot props 注入子元素 context）
- [x] 3.4 处理 slot children 为函数形式（返回 slot 渲染函数）
- [x] 3.5 添加具名插槽渲染测试用例
- [x] 3.6 添加 slot props 传递测试用例
- [x] 3.7 验证 Table basic demo bodyCell/headerCell 插槽正确渲染

## 4. 高级 API scope 扩展 (P2)

- [x] 4.1 修改 plugin-antd/src/plugin.ts scopeExtensions，添加 modal API
- [x] 4.2 实现 _antd.modal.confirm/info/success/error 方法
- [x] 4.3 实现 _antd.message.success/error/warning/info 方法（已有，确认可用）
- [x] 4.4 实现 _antd.notification.success/error/warning/info 方法（已有，确认可用）
- [x] 4.5 添加 _antd scope 类型声明
- [x] 4.6 添加 Modal.confirm 调用测试用例
- [x] 4.7 验证 Modal confirm demo 可简化转换

## 5. 验证与文档

- [x] 5.1 运行 npm run lint 确保代码风格符合规范
- [x] 5.2 运行 npm run typecheck 确保类型定义正确
- [x] 5.3 运行 npm test 确保所有测试通过
- [ ] 5.4 创建简单验证 demo（Modal basic + Icon basic + Table basic）
- [ ] 5.5 更新 plugin-antd README 文档说明新功能
- [ ] 5.6 更新 vue-json types 导出说明