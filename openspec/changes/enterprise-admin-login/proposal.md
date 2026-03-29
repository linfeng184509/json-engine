## Why

企业级管理系统需要完整的登录认证流程，包括用户身份验证、权限控制、实时状态同步和消息推送。当前项目缺少一个基于纯 JSON Schema 的企业前端演示项目，无法展示 vue-json 在实际企业场景中的完整应用能力。

通过建立 enterprise-admin 子项目，可以验证 JSON Schema 驱动的企业级前端开发模式，为后续更多业务场景提供可复用的模板和最佳实践。

## What Changes

- 新增 `enterprise-admin` 子项目到 `src/packages/`
- 使用 Ant Design Vue 4.x 作为 UI 组件库
- 实现基于 JSON Schema 的登录页面（login.json）
- 添加 Mock API 服务模拟完整登录流程（登录、登出、用户信息、权限、菜单）
- 建立 Node WebSocket 服务端实现登录状态同步和实时通知推送
- 配置 vue-json 运行时支持 Ant Design Vue 组件渲染

## Capabilities

### New Capabilities

- `enterprise-app-config`: 企业应用级配置 Schema，包含 router、stores、ui、network、websocket 等顶层配置
- `login-page`: 登录页面 JSON Schema，定义表单结构、验证逻辑、状态管理、事件处理和渲染模板
- `auth-mock-api`: 认证相关 Mock API，包括登录、登出、验证码、token 刷新、用户信息、权限、菜单
- `websocket-service`: WebSocket 服务能力，支持登录状态同步、强制踢下线、实时通知推送、心跳保活

### Modified Capabilities

（无修改的现有 capability，所有功能均为新增）

## Impact

**新增代码**
- `src/packages/enterprise-admin/` 整个子项目目录
- `server/` WebSocket 服务端独立进程

**新增依赖**
- ant-design-vue@4.x（UI 组件库）
- ws（WebSocket 服务端）
- mockjs 或 vite-plugin-mock（Mock 数据）

**API 影响**
- 新增 RESTful Mock API（/api/auth/*, /api/user/*）
- 新增 WebSocket 消息协议（auth:*, notification:*）

**系统集成**
- vue-json 需注册 Ant Design Vue 组件到渲染器
- 应用配置 Schema 扩展支持 websocket 配置项