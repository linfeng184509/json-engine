---
name: json-app-development
description: "使用纯 JSON Schema 开发 Vue 应用的完整指南。覆盖 Schema 结构定义、类型系统、引用规则、指令系统、插件机制、运行时规则。适用于使用 @json-engine/core-engine、@json-engine/vue-json 和 @json-engine/plugins 进行低代码应用开发。"
license: MIT
compatibility: "@json-engine/vue-json 0.0.1, Vue 3.4+"
metadata:
  author: JSON Engine Team
  version: "1.0"
---

# JSON Application Development Skill

使用纯 JSON Schema 开发 Vue 3 应用的完整开发规范。

## When to Apply

### Must Use

本技能必须在以下场景使用：

- 创建或修改 JSON Schema 组件/页面定义
- 使用 `@json-engine/core-engine`、`@json-engine/vue-json` 或 `@json-engine/plugins`
- 开发低代码/无代码应用平台
- 编写 JSON Schema 验证和解析逻辑

### Recommended

推荐在以下场景使用：

- 快速原型开发和动态页面生成
- 表单驱动应用（CRUD 页面、工作流表单）
- 需要动态加载/热更新的组件系统
- 多端适配的同一 Schema 配置

### Skip

本技能不适用于：

- 传统 Vue SFC 组件开发（使用 `.vue` 文件）
- 纯后端 API 开发
- React/Angular 等其他框架开发

---

## 核心架构概览

```
┌─────────────────────────────────────────────────────────────────────┐
│                        JSON Application 架构                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────────┐                                              │
│   │   JSON Schema    │  输入层：纯 JSON 定义                         │
│   │  (VueJsonSchema) │                                              │
│   └────────┬─────────┘                                              │
│            │                                                         │
│            ▼                                                         │
│   ┌──────────────────┐                                              │
│   │   core-engine    │  解析层：类型系统 + 递归解析                  │
│   │  - parseJson()   │                                              │
│   │  - typeParsers   │                                              │
│   └────────┬─────────┘                                              │
│            │                                                         │
│            ▼                                                         │
│   ┌──────────────────┐    ┌──────────────────┐                      │
│   │    vue-json      │◄───│     plugins      │                      │
│   │  - component     │    │  - scopeExtent   │                      │
│   │    factory       │    │  - valueTypes    │                      │
│   │  - render        │    │  - components    │                      │
│   │    factory       │    └──────────────────┘                      │
│   └────────┬─────────┘                                              │
│            │                                                         │
│            ▼                                                         │
│   ┌──────────────────┐                                              │
│   │   Vue Component  │  输出层：可运行的 Vue 组件                    │
│   └──────────────────┘                                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 核心概念速查

### 类型系统

所有解析后的值使用 `_type` 作为类型标识符（Discriminated Union）：

| _type | 来源语法 | 示例 |
|-------|----------|------|
| `string` | `{ type: 'string', body: "'value'" }` | `{ _type: 'string', value: 'value' }` |
| `scope` | `{{$_scope_var}}` | `{ _type: 'scope', scope: 'core', variable: 'api' }` |
| `reference` | `{{ref_prefix_var}}` | `{ _type: 'reference', prefix: 'state', variable: 'count' }` |
| `expression` | `{{expression}}` | `{ _type: 'expression', expression: 'a + b' }` |
| `function` | `{ type: 'function', ... }` | `{ _type: 'function', params: {}, body: '...' }` |
| `object` | `{ type: 'object', ... }` | `{ _type: 'object', key: 'k', value: 'v' }` |

### 引用语法速查表

| 引用目标 | 正确语法 | 解析结果 |
|----------|----------|----------|
| State (ref) | `{{ref_state_<name>}}` | `state.<name>.value` |
| State (reactive) | `{{ref_state_<name>}}` | `state.<name>` |
| Props | `{{ref_props_<name>}}` | `props.<name>` |
| Computed | `{{ref_computed_<name>}}` | `computed.<name>.value` |
| Core Scope | `{{$_core_<prop>}}` | `coreScope.<prop>` |
| Goal Scope | `{{$_goal_<prop>}}` | `goalScope.<prop>` |

### Scope 扩展速查表

| Scope Key | Plugin | 功能描述 |
|-----------|--------|----------|
| `_auth` | plugin-auth | `user`, `isAuthenticated()`, `hasPermission()` |
| `_router` | plugin-router | `push()`, `replace()`, `back()`, `go()` |
| `_storage` | plugin-storage | `get()`, `set()`, `remove()`, `clear()` |
| `_api` | plugin-axios | `get()`, `post()`, `put()`, `delete()` |
| `_ws` | plugin-websocket | `send()`, `subscribe()`, `connect()` |
| `_i18n` | plugin-i18n | `t()`, `setLocale()`, `getLocale()` |
| `_pinia` | plugin-pinia | `useStore()`, `registerStore()` |

---

## 必须遵守的规则

### Schema 结构规则

| ID | 规则 | 错误 | 正确 |
|----|------|------|------|
| S01 | `name` 字段必需且唯一 | `{}` | `{ "name": "ComponentName" }` |
| S02 | `render` 字段必需 | 无 render | `{ "render": { "type": "template", ... } }` |
| S03 | `render.type` 必须是 `template` 或 `function` | `{ "render": {} }` | `{ "render": { "type": "template", "content": {...} } }` |
| S04 | state type 与 initial 值类型必须匹配 | `{ "type": "ref", "initial": {} }` | `{ "type": "ref", "initial": 0 }` |

### 类型引用规则

| ID | 规则 | 错误语法 | 正确语法 |
|----|------|----------|----------|
| R01 | State 引用必须使用 `ref_state_` | `{{state.count}}` | `{{ref_state_count}}` |
| R02 | Props 引用必须使用 `ref_props_` | `{{props.title}}` | `{{ref_props_title}}` |
| R03 | Computed 引用必须使用 `ref_computed_` | `{{computed.doubled}}` | `{{ref_computed_doubled}}` |
| R04 | Scope 引用必须使用 `$_scope_` 格式 | `{{$_core_api}}` | `{{$_core_api}}` |
| R05 | 嵌套路径使用 `.` 分隔 | `{{ref_state_user.name}}` | `{{ref_state_user.name}}` ✓ |

### 函数体规则

| ID | 规则 | 描述 |
|----|------|------|
| F01 | ref 类型 state 需要 `.value` | `state.count` → `state.count.value` |
| F02 | reactive 类型 state 直接访问 | `state.form.name` ✓ |
| F03 | computed 需要 `.value` | `computed.doubled.value` |
| F04 | 可访问 `coreScope` 扩展 | `coreScope._api.get('/data')` |

### 指令规则

| ID | 规则 | 错误 | 正确 |
|----|------|------|------|
| D01 | vIf 值必须是 ExpressionValue | `{ "vIf": true }` | `{ "vIf": { "_type": "expression", "expression": "{{ref_state_visible}}" } }` |
| D02 | vFor 必须有 source 和 alias | `{ "vFor": {} }` | `{ "vFor": { "source": {...}, "alias": "item" } }` |
| D03 | vModel.prop 必须是 reference | `{ "vModel": { "prop": "value" } }` | `{ "vModel": { "prop": { "_type": "reference", "prefix": "state", "variable": "value" } } }` |
| D04 | vOn 键名格式正确 | `{ "vOn": { "click prevent": {} } }` | `{ "vOn": { "click.prevent": {} } }` |

---

## 参考文档

详细规则和示例请查阅以下参考文件：

| 文档 | 内容 |
|------|------|
| `references/schema-structure.md` | VueJsonSchema 完整结构定义与字段约束 |
| `references/type-system.md` | 类型系统详解、解析规则、类型守卫 |
| `references/reference-rules.md` | 引用语法完整规则、嵌套路径、Scope 扩展 |
| `references/directives.md` | 所有指令的使用规则与正确示例 |
| `references/plugin-system.md` | 插件架构、注册规则、Scope 扩展使用 |
| `references/runtime-rules.md` | 运行时上下文、值解析、表达式执行规则 |
| `references/examples.md` | 正确示例与常见错误对比 |

---

## 快速开发流程

### 1. 创建基础组件

```json
{
  "name": "Counter",
  "state": {
    "count": { "type": "ref", "initial": 0 }
  },
  "methods": {
    "increment": { "_type": "function", "params": {}, "body": "state.count.value++" }
  },
  "render": {
    "type": "template",
    "content": {
      "type": "div",
      "children": [
        { "type": "span", "children": { "_type": "expression", "expression": "{{ref_state_count}}" } },
        { "type": "button", "directives": { "vOn": { "click": { "_type": "function", "params": {}, "body": "methods.increment()" } } }, "children": "Increment" }
      ]
    }
  }
}
```

### 2. 使用插件功能

```json
{
  "name": "UserPage",
  "state": {
    "users": { "type": "ref", "initial": [] }
  },
  "methods": {
    "loadUsers": {
      "_type": "function",
      "params": {},
      "body": "coreScope._api.get('/users').then(res => { state.users.value = res.data })"
    }
  },
  "lifecycle": {
    "onMounted": { "_type": "function", "params": {}, "body": "methods.loadUsers()" }
  },
  "render": {
    "type": "template",
    "content": {
      "type": "a-table",
      "props": {
        "dataSource": { "_type": "expression", "expression": "{{ref_state_users}}" },
        "columns": [
          { "title": "Name", "dataIndex": "name" },
          { "title": "Email", "dataIndex": "email" }
        ]
      }
    }
  }
}
```

### 3. 组件注册与使用

```typescript
import { createComponent, getPluginRegistry } from '@json-engine/vue-json';
import { axiosPlugin, antdPlugin } from '@json-engine/plugins';

// 注册插件
const registry = getPluginRegistry();
registry.register(axiosPlugin);
registry.register(antdPlugin);

// 创建组件
const component = createComponent(schema);

// 在 Vue 中使用
app.component('JsonPage', component);
```

---

## Guardrails

必须遵守以下约束：

1. **Schema 结构约束**: `name` 和 `render` 必需，字段类型必须匹配
2. **引用语法约束**: 必须使用正确的 `ref_` 和 `$_` 格式
3. **函数体约束**: ref/computed 需要 `.value`，reactive 直接访问
4. **指令约束**: 指令值必须是正确的结构化类型
5. **插件约束**: 使用插件功能前必须注册对应插件
6. **类型标识约束**: 所有解析值必须有 `_type` 字段

---

## 错误诊断

当出现以下错误时，检查对应规则：

| 错误现象 | 可能原因 | 检查规则 |
|----------|----------|----------|
| 组件无法渲染 | name/render 缺失 | S01, S02 |
| 值无法解析 | 引用语法错误 | R01-R05 |
| 函数执行失败 | .value 缺失或多余 | F01-F04 |
| 指令不生效 | 结构类型错误 | D01-D04 |
| Scope 功能不可用 | 插件未注册 | P01-P04 |

---

## 版本兼容

- `@json-engine/core-engine`: 0.0.1
- `@json-engine/vue-json`: 0.0.1
- `@json-engine/plugins`: 0.0.1
- Vue: 3.4+