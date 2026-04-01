# Reference Rules - 引用系统规则

本文档定义 JSON Schema 中的引用语法规则、嵌套路径规则和 Scope 扩展规则。

---

## 引用语法概览

### 引用类型速查表

| 引用目标 | 正确语法 | 解析结果 (表达式) | 解析结果 (函数体) |
|----------|----------|-------------------|-------------------|
| State (ref) | `{{ref_state_<name>}}` | `state.<name>.value` | `state.<name>.value` |
| State (reactive) | `{{ref_state_<name>}}` | `state.<name>` | `state.<name>` |
| State (嵌套) | `{{ref_state_<obj>.<prop>}}` | `state.<obj>.<prop>` | `state.<obj>.<prop>` |
| Props | `{{ref_props_<name>}}` | `props.<name>` | `props.<name>` |
| Props (嵌套) | `{{ref_props_<obj>.<prop>}}` | `props.<obj>.<prop>` | `props.<obj>.<prop>` |
| Computed | `{{ref_computed_<name>}}` | `computed.<name>.value` | `computed.<name>.value` |
| Core Scope | `{{$_core_<prop>}}` | `coreScope.<prop>` | `coreScope.<prop>` |
| Goal Scope | `{{$_goal_<prop>}}` | `goalScope.<prop>` | `goalScope.<prop>` |

---

## 禁止的错误语法

### 常见错误对照表

| 错误语法 | 问题 | 正确语法 |
|----------|------|----------|
| `{{state.count}}` | 直接访问 state | `{{ref_state_count}}` |
| `{{props.title}}` | 直接访问 props | `{{ref_props_title}}` |
| `{{computed.doubled}}` | 直接访问 computed | `{{ref_computed_doubled}}` |
| `{{$_core_api}}` | 缺少方括号 | `{{$_core_api}}` |
| `{{ref_State_count}}` | 大小写错误 | `{{ref_state_count}}` |
| `{{ref-state-count}}` | 分隔符错误 | `{{ref_state_count}}` |
| `{$_core_api}` | 缺少双花括号 | `{{$_core_api}}` |
| `{{ref props count}}` | 空格分隔 | `{{ref_state_count}}` |

---

## State 引用规则

### 规则 ID | 描述

| ID | 规则 |
|----|------|
| **R01** | State 引用必须使用 `{{ref_state_<name>}}` 格式 |
| **R02** | `<name>` 必须是 state 定义中存在的变量名 |
| **R03** | ref 类型 state 需要 `.value` 访问（函数体内） |
| **R04** | reactive 类型 state 直接访问属性 |
| **R05** | 嵌套路径使用 `.` 分隔，最多支持 5 级 |

### State 引用示例

```json
{
  "state": {
    "count": { "type": "ref", "initial": 0 },
    "form": { "type": "reactive", "initial": { "name": "", "email": "" } },
    "user": { "type": "ref", "initial": { "profile": { "age": 0 } } }
  },
  
  // 正确引用
  "computed": {
    "doubled": { "getter": "{{ref_state_count * 2}}" },
    "userName": { "getter": "{{ref_state_form.name}}" },
    "userAge": { "getter": "{{ref_state_user.profile.age}}" }
  },
  
  // 函数体内正确访问
  "methods": {
    "increment": {
      "_type": "function",
      "params": {},
      "body": "state.count.value++"  // ref 类型需要 .value
    },
    "updateName": {
      "_type": "function",
      "params": { "name": "" },
      "body": "state.form.name = name"  // reactive 直接访问
    }
  }
}

// 错误示例 - 规则 R01 违反
{
  "computed": {
    "doubled": { "getter": "{{state.count * 2}}" }  // ❌ 直接访问
  }
}

// 错误示例 - 规则 R03 违反
{
  "methods": {
    "increment": {
      "_type": "function",
      "params": {},
      "body": "state.count++"  // ❌ ref 类型缺少 .value
    }
  }
}
```

### State 类型与访问对照

| State 定义类型 | 表达式中 | 函数体内 | 说明 |
|----------------|----------|----------|------|
| `ref` (原始值) | `{{ref_state_x}}` → `state.x.value` | `state.x.value` | 需要 .value |
| `ref` (对象) | `{{ref_state_x.prop}}` → `state.x.value.prop` | `state.x.value.prop` | 需要 .value |
| `reactive` | `{{ref_state_x.prop}}` → `state.x.prop` | `state.x.prop` | 直接访问 |
| `shallowRef` | `{{ref_state_x}}` → `state.x.value` | `state.x.value` | 需要 .value |
| `shallowReactive` | `{{ref_state_x.prop}}` → `state.x.prop` | `state.x.prop` | 直接访问（浅） |

---

## Props 引用规则

### 规则 ID | 描述

| ID | 规则 |
|----|------|
| **R06** | Props 引用必须使用 `{{ref_props_<name>}}` 格式 |
| **R07** | `<name>` 必须是 props 定义中存在的属性名 |
| **R08** | Props 是只读的，不能在函数体内修改 |
| **R09** | 嵌套 Props 使用 `.` 分隔路径 |

### Props 引用示例

```json
{
  "props": {
    "title": { "type": "String", "required": true },
    "user": { "type": "Object", "default": {} },
    "items": { "type": "Array", "default": [] }
  },
  
  // 正确引用
  "computed": {
    "displayTitle": { "getter": "{{ref_props_title}}" },
    "userName": { "getter": "{{ref_props_user.name}}" },
    "firstItem": { "getter": "{{ref_props_items[0]}}" }
  },
  
  // 函数体内正确访问（只读）
  "methods": {
    "logTitle": {
      "_type": "function",
      "params": {},
      "body": "console.log(props.title)"  // ✓ 只读访问
    }
  }
}

// 错误示例 - 规则 R08 违反
{
  "methods": {
    "updateTitle": {
      "_type": "function",
      "params": { "newTitle": "" },
      "body": "props.title = newTitle"  // ❌ Props 是只读的
    }
  }
}
```

---

## Computed 引用规则

### 规则 ID | 描述

| ID | 规则 |
|----|------|
| **R10** | Computed 引用必须使用 `{{ref_computed_<name>}}` 格式 |
| **R11** | `<name>` 必须是 computed 定义中存在的属性名 |
| **R12** | Computed 需要 `.value` 访问（函数体内） |
| **R13** | 可写 computed 的 setter 通过赋值调用 |

### Computed 引用示例

```json
{
  "state": {
    "count": { "type": "ref", "initial": 0 }
  },
  
  "computed": {
    "doubled": { 
      "getter": "{{ref_state_count * 2}}" 
    },
    "fullName": {
      "getter": "{{ref_state_firstName + ' ' + ref_state_lastName}}",
      "setter": "{{value => { const [first, last] = value.split(' '); state.firstName.value = first; state.lastName.value = last; }}}"
    }
  },
  
  // 正确引用
  "render": {
    "type": "template",
    "content": {
      "type": "div",
      "children": { "_type": "expression", "expression": "{{ref_computed_doubled}}" }
    }
  },
  
  // 函数体内正确访问
  "methods": {
    "logDoubled": {
      "_type": "function",
      "params": {},
      "body": "console.log(computed.doubled.value)"  // ✓ 需要 .value
    },
    "setFullName": {
      "_type": "function",
      "params": { "name": "" },
      "body": "computed.fullName.value = name"  // ✓ 可写 computed setter
    }
  }
}
```

---

## Scope 引用规则

### 规则 ID | 描述

| ID | 规则 |
|----|------|
| **R14** | Scope 引用必须使用 `{{$_scope_<prop>}}` 格式 |
| **R15** | `[scope]` 必须是有效的 scope 名称（core, goal, 或自定义） |
| **R16** | `<prop>` 必须是该 scope 下存在的属性/方法 |
| **R17** | 使用 Scope 功能前必须注册对应插件 |

### Scope 引用示例

```json
{
  "methods": {
    // Core Scope - API 调用
    "loadData": {
      "_type": "function",
      "params": {},
      "body": "coreScope._api.get('/data').then(res => { state.data.value = res })"
    },
    
    // Core Scope - 路由导航
    "navigate": {
      "_type": "function",
      "params": { "path": "" },
      "body": "coreScope._router.push(path)"
    },
    
    // Core Scope - 存储操作
    "savePreference": {
      "_type": "function",
      "params": { "key": "", "value": "" },
      "body": "coreScope._storage.set(key, value)"
    },
    
    // Core Scope - 国际化
    "translate": {
      "_type": "function",
      "params": { "key": "" },
      "body": "return coreScope._i18n.t(key)"
    }
  },
  
  // 表达式中使用 Scope
  "computed": {
    "isLoggedIn": {
      "getter": "{{$_core_auth.isAuthenticated()}}"
    },
    "currentLocale": {
      "getter": "{{$_core_i18n.getLocale()}}"
    }
  }
}

// 错误示例 - 规则 R14 违反
{
  "methods": {
    "navigate": {
      "_type": "function",
      "params": { "path": "" },
      "body": "core._router.push(path)"  // ❌ 缺少 Scope 关键字
    }
  }
}

// 错误示例 - 规则 R17 违反（插件未注册）
{
  "methods": {
    "loadData": {
      "_type": "function",
      "params": {},
      "body": "coreScope._api.get('/data')"  // ❌ axiosPlugin 未注册
    }
  }
}
```

---

## 嵌套路径规则

### 规则 ID | 描述

| ID | 规则 |
|----|------|
| **R18** | 嵌套路径使用 `.` 分隔各级 |
| **R19** | 数组索引使用 `[n]` 格式 |
| **R20** | 最多支持 5 级嵌套深度 |
| **R21** | 路径中不应有空格 |

### 嵌套路径示例

```json
{
  "state": {
    "user": { "type": "ref", "initial": { "profile": { "address": { "city": "" } } } },
    "items": { "type": "ref", "initial": [] }
  },
  
  // 正确：对象嵌套路径
  "computed": {
    "userCity": { "getter": "{{ref_state_user.profile.address.city}}" }
  },
  
  // 正确：数组索引
  "computed": {
    "firstItem": { "getter": "{{ref_state_items[0]}}" },
    "firstItemName": { "getter": "{{ref_state_items[0].name}}" }
  },
  
  // 函数体内正确访问
  "methods": {
    "updateCity": {
      "_type": "function",
      "params": { "city": "" },
      "body": "state.user.value.profile.address.city = city"  // ref 需 .value
    },
    "addItem": {
      "_type": "function",
      "params": { "item": {} },
      "body": "state.items.value.push(item)"  // ref 需 .value
    }
  }
}

// 错误示例 - 规则 R18 违反
{
  "computed": {
    "userCity": { "getter": "{{ref_state_user/profile/address/city}}" }  // ❌ 分隔符错误
  }
}

// 错误示例 - 规则 R19 违反
{
  "computed": {
    "firstItem": { "getter": "{{ref_state_items.0}}" }  // ❌ 数组索引格式错误
  }
}
```

---

## 表达式与函数体转换规则

### 表达式转换

| 表达式 | 转换结果 |
|--------|----------|
| `{{ref_state_count}}` | `state.count.value` (ref) / `state.count` (reactive) |
| `{{ref_props_title}}` | `props.title` |
| `{{ref_computed_doubled}}` | `computed.doubled.value` |
| `{{$_core_api}}` | `coreScope._api` |
| `{{ref_state_count + 1}}` | `state.count.value + 1` |
| `{{ref_state_form.name}}` | `state.form.name` |

### 函数体转换规则

| 规则 ID | 规则 |
|---------|------|
| **R22** | 函数体内 `state.<name>` 保持原样（需手动判断类型） |
| **R23** | 函数体内 `props.<name>` 保持原样 |
| **R24** | 函数体内 `computed.<name>` 保持原样（需加 .value） |
| **R25** | 函数体内 `coreScope.<prop>` 保持原样 |

---

## 插件依赖规则

### Scope 与插件对照

| Scope Key | 所需插件 | 安装命令 |
|-----------|----------|----------|
| `_auth` | `@json-engine/plugin-auth` | `registry.register(authPlugin)` |
| `_router` | `@json-engine/plugin-router` | `registry.register(routerPlugin)` |
| `_storage` | `@json-engine/plugin-storage` | `registry.register(storagePlugin)` |
| `_api` | `@json-engine/plugin-axios` | `registry.register(axiosPlugin)` |
| `_ws` | `@json-engine/plugin-websocket` | `registry.register(wsPlugin)` |
| `_i18n` | `@json-engine/plugin-i18n` | `registry.register(i18nPlugin)` |
| `_pinia` | `@json-engine/plugin-pinia` | `registry.register(piniaPlugin)` |

### 规则 ID | 描述

| ID | 规则 |
|----|------|
| **R26** | 使用 `_auth` 前必须注册 authPlugin |
| **R27** | 使用 `_router` 值必须注册 routerPlugin |
| **R28** | 使用 `_storage` 值必须注册 storagePlugin |
| **R29** | 使用 `_api` 值必须注册 axiosPlugin |
| **R30** | 使用 `_ws` 值必须注册 wsPlugin |
| **R31** | 使用 `_i18n` 值必须注册 i18nPlugin |
| **R32** | 使用 `_pinia` 值必须注册 piniaPlugin |

---

## 规则汇总表

| ID | 领域 | 规则 |
|----|------|------|
| R01 | State | 必须用 `{{ref_state_<name>}}` |
| R02 | State | `<name>` 必须存在 |
| R03 | State | ref 类型需 `.value` |
| R04 | State | reactive 直接访问 |
| R05 | State | 嵌套最多 5 级 |
| R06 | Props | 必须用 `{{ref_props_<name>}}` |
| R07 | Props | `<name>` 必须存在 |
| R08 | Props | 只读不可修改 |
| R09 | Props | 嵌套用 `.` 分隔 |
| R10 | Computed | 必须用 `{{ref_computed_<name>}}` |
| R11 | Computed | `<name>` 必须存在 |
| R12 | Computed | 需 `.value` |
| R13 | Computed | setter 通过赋值调用 |
| R14 | Scope | 必须用 `{{$_scope_<prop>}}` |
| R15 | Scope | `[scope]` 必须有效 |
| R16 | Scope | `<prop>` 必须存在 |
| R17 | Scope | 插件必须注册 |
| R18 | Path | 嵌套用 `.` 分隔 |
| R19 | Path | 数组用 `[n]` |
| R20 | Path | 最多 5 级 |
| R21 | Path | 无空格 |
| R22-R25 | Body | 函数体内保持原样 |
| R26-R32 | Plugin | 使用前必须注册 |