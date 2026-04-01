## Context

当前 vue-json 缺乏权限机制，组件中无法进行权限检查。使用者需要自行在业务代码中处理权限，增加开发负担。需要提供一套可插拔的权限基础设施。

## Goals / Non-Goals

**Goals:**
- 提供 PermissionProvider 接口，使用者可接入任意权限系统
- 提供 PermissionChecker 基础检查方法
- 支持字段级别权限控制（读/写/隐藏/隐私）
- 支持 SOP 流程步骤权限
- 支持多平台检测
- 在 JSON Schema 中声明式使用权限

**Non-Goals:**
- 不实现具体的权限管理逻辑（那是使用者的责任）
- 不预定义角色、权限模型
- 不与特定权限框架耦合

## Decisions

### Decision 1: 接口驱动设计

**选择:** 通过 PermissionProvider 接口获取权限数据，而非内置权限存储

**理由:** 
- 解耦框架与权限系统
- 使用者可以接入任何权限系统（Casbin、RBAC、ABAC等）

### Decision 2: 权限检查下沉到 Core Scope

**选择:** 通过 `$_core_auth.xxx` 访问权限方法，而非全局函数

**理由:**
- 与现有的 `$_core_api`, `$_core_storage` 保持一致
- 可在表达式中直接使用

### Decision 3: 声明式权限指令

**选择:** 通过 `directives.permission` 在 Schema 中声明权限需求

**理由:**
- 声明式优于命令式，配置更清晰
- 与 Vue 指令系统概念一致

### Decision 4: 平台检测自动完成

**选择:** 自动检测设备类型，通过 Provider 接口暴露

**理由:**
- 减少使用者配置负担
- 标准化的平台代码

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 权限检查性能 | 提供缓存机制，减少 Provider 调用频率 |
| 权限配置复杂 | 提供默认实现，简化常见场景 |
| 学习曲线 | 渐进式引入，从简单权限检查开始 |

## Open Questions

1. 是否需要支持权限缓存的自动刷新策略？
2. SOP 步骤间的数据传递如何处理？
3. 是否需要支持权限变更的实时通知？
