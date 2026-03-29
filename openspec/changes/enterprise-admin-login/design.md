## Context

当前项目 json-engine 是一个基于 JSON Schema 驱动前端应用的框架，包含：
- `@json-engine/core-engine`: JSON 解析核心
- `@json-engine/vue-json`: Vue 3 运行时
- `@json-engine/vue-json-playground`: 示例项目（仅有 counter, todo-list, form 等简单演示）

缺少一个完整的、企业级的应用演示项目来验证框架在实际业务场景中的能力。企业管理系统需要完整的认证流程、权限控制、实时状态同步等特性。

技术约束：
- 必须使用纯 JSON Schema 定义页面和逻辑
- 需要兼容 Ant Design 设计规范
- Mock API 和 WebSocket 服务需独立可运行

## Goals / Non-Goals

**Goals:**

1. 建立 enterprise-admin 子项目作为企业级 JSON Schema 应用模板
2. 实现完整的登录认证流程（登录、登出、验证码、token 管理）
3. Mock API 模拟真实企业后端响应（用户信息、权限、菜单）
4. WebSocket 服务支持多端登录状态同步和实时通知推送
5. 登录页面 JSON Schema 符合 Ant Design 设计规范（1440px 画布、8px 间距、品牌色）

**Non-Goals:**

1. 不实现完整的后台管理功能（如用户管理、角色管理等）—— 仅验证登录流程
2. 不使用真实的后端数据库 —— 仅 Mock 数据
3. 不实现 SSR 或移动端适配 —— 仅桌面端 Web
4. 不引入额外的状态管理库（如 Pinia）—— 使用 vue-json 内置状态系统
5. 不实现复杂的权限模型 —— 仅演示基础权限码检查

## Decisions

### D1: UI 框架选择 — Ant Design Vue 4.x

**选择**: Ant Design Vue 4.x

**理由**:
- 企业级 UI 设计规范成熟（符合 antd-design-spec 技能要求）
- Vue 3 + TypeScript 支持完善
- 组件丰富（Form, Input, Button, Checkbox, Layout 等）
- 社区活跃，文档完善

**替代方案**:
- Element Plus: 同为 Vue 3 组件库，但设计规范不如 Ant Design 企业级
- Naive UI: 性能优秀，但企业级场景经验较少

### D2: Mock 方案 — vite-plugin-mock

**选择**: vite-plugin-mock（基于 mockjs）

**理由**:
- 与 Vite 开发服务器无缝集成
- 支持 TypeScript 定义 Mock 数据
- 可切换 Mock 与真实 API（生产环境不启用）
- 开发时无需启动额外 Mock 服务进程

**替代方案**:
- Mock.js 独立服务: 需要额外启动进程，配置繁琐
- MSW (Mock Service Worker): 功能强大但学习成本高

### D3: WebSocket 服务 — Node.js + ws 库

**选择**: Node.js 原生 WebSocket (ws 库)

**理由**:
- 轻量级，无需 Express/Koa 等框架
- 与前端项目可独立运行（server/ 目录）
- 支持心跳、重连、消息分发等核心功能
- TypeScript 类型支持

**替代方案**:
- Socket.IO: 功能更全但引入额外复杂度
- uWebSockets.js: 性能最高但 C++ 绑定，调试困难

### D4: 登录页 Schema 结构 — 表单卡片布局

**选择**: 基础表单（单卡片）布局

**理由**:
- 登录表单字段 < 7（用户名、密码、验证码、记住我）
- 符合 Ant Design 表单页面模板：Fields < 7 → 基础表单（单 section）
- 居中布局，符合企业登录页惯例

**关键 Schema 节点**:
- `state.formData`: reactive 存储表单数据
- `state.loading`: ref 控制按钮加载状态
- `methods.handleLogin`: 登录提交函数
- `methods.validateForm`: 表单验证
- `render`: Ant Design Form 组件渲染树

### D5: WebSocket 消息协议 — JSON 结构化消息

**选择**: JSON 格式消息，包含 `type` 和 `payload`

```typescript
interface WSMessage {
  type: string;      // 'auth:login' | 'auth:kick' | 'notification:push' 等
  payload: unknown;  // 消息体
  timestamp: number; // 时间戳
  seq?: number;      // 序列号（用于确认）
}
```

**理由**:
- 结构化消息便于类型验证和路由处理
- `type` 字段便于消息分发到不同 handler
- 序列号支持消息确认机制

**替代方案**:
- 自定义二进制协议: 性能高但调试困难，不适合演示项目

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Ant Design Vue 组件注册到 vue-json 渲染器可能不兼容 | 使用 vue-json 的 `ui` 配置项注册全局组件，测试核心组件渲染 |
| WebSocket 心跳机制可能导致连接不稳定 | 使用 30s 心跳间隔 + 3 次重试机制，超时自动重连 |
| Mock API 与真实 API 响应格式不一致 | 定义 TypeScript 类型约束 Mock 响应格式 |
| 登录 token 管理在纯前端 Mock 中无法持久化 | 使用 localStorage 存储 mock token，页面刷新时恢复状态 |
| JSON Schema 函数体字符串可能编写复杂 | 遵循 vue-json 已有语法（`{{{params}}}`, `{{body}}`），参考 form.json 示例 |

## Migration Plan

此为新项目，无需迁移。部署步骤：

1. 开发环境：`npm run dev` 启动前端 + Mock API
2. WebSocket 服务：`cd server && npm run start` 单独启动
3. 生产构建：`npm run build` 输出到 `dist/`

## Open Questions

1. ~~是否需要验证码功能~~ → 已确认需要（Mock 返回随机图形验证码）
2. ~~WebSocket 是否需要支持多用户会话管理~~ → 简化版：仅演示单用户登录状态同步
3. 登录成功后是否跳转到 Dashboard 页面 → 暂定跳转到空白首页（后续可扩展）