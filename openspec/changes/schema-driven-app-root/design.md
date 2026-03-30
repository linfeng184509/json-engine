## Context

当前 `enterprise-admin/src/App.vue` 包含约 140 行 TypeScript 逻辑，负责：
- 应用配置加载与初始化
- hash-based 路由切换
- 页面 Schema 动态加载
- 加载状态与错误处理
- WebSocket 连接管理

这些逻辑与 "纯 JSON 引擎" 的设计理念冲突。vue-json 已提供 `createComponent`、`useVueJson`、`CoreScope` 等基础设施，但缺少 **Schema 内动态加载其他 Schema** 的能力。

## Goals / Non-Goals

**Goals:**
- 实现从 Schema 内动态加载子 Schema 的能力
- 创建 PageLoader 组件作为 Schema 中页面加载的桥梁
- 定义 app-root.json Schema 规范，涵盖初始化、路由、状态管理
- 简化 App.vue 为极简 bootstrap（仅加载 app-root schema）
- 保持向后兼容，现有 Schema 无需修改

**Non-Goals:**
- 不改变现有 createComponent 的核心逻辑（仅扩展）
- 不实现 SSR 或服务端渲染
- 不重构 enterprise-admin 的其他 TypeScript 文件

## Decisions

### Decision 1: Schema 加载架构

**选择**: 在 CoreScope 中新增 `_loader` API，而非创建独立 Loader 类。

**理由**:
- CoreScope 已提供 `_api`、`_storage`、`_auth` 等统一接口
- Schema 内可通过 `{{scope._loader.load(path)}}` 调用
- 避免引入新的全局状态管理机制

**替代方案**:
- (A) 独立 SchemaLoader 类 - 需要额外注入机制，增加复杂度
- (B) 扩展 createComponent 选项 - 无法在 Schema methods 中使用

### Decision 2: PageLoader 组件实现

**选择**: 作为 Vue SFC 组件实现，通过 extraComponents 注册。

**理由**:
- SFC 提供完整的生命周期控制
- 可复用 vue-json 内部 API（loadSchema、createComponent）
- 易于测试和维护

**替代方案**:
- (A) 纯 Schema 定义 - 无法处理动态加载的复杂逻辑
- (B) 内置到 vue-json 核心 - 增加核心包体积

### Decision 3: app-root.json 结构

**选择**: 使用标准 VueJsonSchema 结构，扩展 lifecycle 支持应用级初始化。

**理由**:
- 无需新的 Schema 类型定义
- 现有 parser 可直接解析
- 与普通页面 Schema 保持一致性

## Risks / Trade-offs

### Risk: Schema 加载性能
**问题**: 每次页面切换都需 fetch Schema。
**缓解**: 使用 `loadSchema` 的缓存机制，首次加载后缓存到内存。

### Risk: 错误处理复杂度
**问题**: Schema 内无法使用传统 try/catch。
**缓解**: 扩展 `_loader` API 返回 `{ success, error, component }` 结构化结果。

### Risk: 路由守卫逻辑
**问题**: 权限检查需在 Schema methods 中表达。
**缓解**: CoreScope `_auth.canAccessPage()` 已提供现成能力。

## Open Questions

1. WebSocket 连接管理是否需要在 Schema lifecycle 中显式处理？
   - 当前建议: 在 app-root.json 的 `onMounted`/`onUnmounted` 中调用 setup-app 提供的函数

2. 是否需要支持 Schema 嵌套加载（页面 Schema 内再加载子 Schema）？
   - 当前建议: 仅支持一层，避免递归复杂度