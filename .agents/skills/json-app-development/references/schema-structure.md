# Schema Structure - JSON Schema 结构定义与约束规则

本文档定义 VueJsonSchema 的完整结构和字段约束规则。

---

## VueJsonSchema 完整结构

```typescript
interface VueJsonSchema {
  name: string;                          // 必需：组件名称
  render: RenderDefinition;              // 必需：渲染定义
  props?: PropsDefinition;               // 可选：组件属性定义
  emits?: EmitsDefinition;               // 可选：事件声明
  state?: StateDefinition;               // 可选：响应式状态
  computed?: ComputedDefinition;         // 可选：计算属性
  methods?: MethodsDefinition;           // 可选：方法
  watch?: WatchDefinition;               // 可选：监听器
  lifecycle?: LifecycleDefinition;       // 可选：生命周期钩子
  components?: ComponentsDefinition;     // 可选：本地组件注册
  provide?: ProvideDefinition;           // 可选：提供 context
  inject?: InjectDefinition;             // 可选：注入 context
  styles?: StylesDefinition;             // 可选：CSS 样式
}
```

---

## 字段约束规则

### 必需字段

| 字段 | 类型 | 规则 ID | 约束说明 |
|------|------|---------|----------|
| `name` | string | **S01** | 必需，唯一标识符，建议 PascalCase |
| `render` | RenderDefinition | **S02** | 必需，定义组件渲染输出 |

### render 字段规则

| 规则 ID | 规则 | 错误示例 | 正确示例 |
|---------|------|----------|----------|
| **S02** | render 字段必需 | `{ "name": "Comp" }` | `{ "name": "Comp", "render": {...} }` |
| **S03** | render.type 必须是 template 或 function | `{ "render": {} }` | `{ "render": { "type": "template", ... } }` |
| **S04** | template 渲染必须有 content | `{ "render": { "type": "template" } }` | `{ "render": { "type": "template", "content": {...} } }` |
| **S05** | function 渲染必须有 body | `{ "render": { "type": "function" } }` | `{ "render": { "type": "function", "body": "return h('div')" } }` |

---

## StateDefinition - 状态定义

### 结构定义

```typescript
interface StateDefinition {
  [key: string]: StateItemDefinition;
}

interface StateItemDefinition {
  type: 'ref' | 'reactive' | 'shallowRef' | 'shallowReactive' | 'toRef' | 'toRefs' | 'readonly';
  initial?: unknown;                     // 初始值（除 toRef/toRefs 外必需）
  source?: string;                       // toRef/toRefs 的源引用
  property?: string;                     // toRef 的属性名
}
```

### 状态类型规则

| type | Vue API | initial 类型约束 | 规则 ID |
|------|---------|------------------|---------|
| `ref` | `ref()` | 原始值：string, number, boolean, null, undefined | **S06** |
| `reactive` | `reactive()` | 必须是对象或数组 | **S07** |
| `shallowRef` | `shallowRef()` | 原始值或对象（浅响应） | **S08** |
| `shallowReactive` | `shallowReactive()` | 必须是对象（浅响应） | **S09** |
| `toRef` | `toRef()` | 不需要 initial，需 source + property | **S10** |
| `toRefs` | `toRefs()` | 不需要 initial，需 source | **S11** |
| `readonly` | `readonly()` | 任意响应式值 | **S12** |

### 状态定义规则示例

```json
// 正确示例
{
  "state": {
    "count": { "type": "ref", "initial": 0 },
    "form": { "type": "reactive", "initial": { "name": "", "email": "" } },
    "items": { "type": "ref", "initial": [] }
  }
}

// 错误示例 - 规则 S06 违反：ref 的 initial 应为原始值
{
  "state": {
    "count": { "type": "ref", "initial": {} }  // ❌ ref 应用于原始值
  }
}

// 错误示例 - 规则 S07 违反：reactive 的 initial 必须是对象
{
  "state": {
    "form": { "type": "reactive", "initial": 0 }  // ❌ reactive 应用于对象
  }
}

// 正确示例 - toRef
{
  "state": {
    "nameRef": { "type": "toRef", "source": "form", "property": "name" }
  },
  "computed": {
    "form": { "getter": "{{ref_props_form}}" }
  }
}
```

---

## PropsDefinition - 属性定义

### 结构定义

```typescript
interface PropsDefinition {
  [key: string]: PropDefinition;
}

interface PropDefinition {
  type: 'String' | 'Number' | 'Boolean' | 'Array' | 'Object' | 'Function' | null;
  required?: boolean;
  default?: unknown;
  validator?: FunctionValue;
}
```

### 属性定义规则

| 规则 ID | 规则 | 错误示例 | 正确示例 |
|---------|------|----------|----------|
| **S13** | type 必须是有效的 Vue prop 类型 | `{ "title": { "type": "string" } }` | `{ "title": { "type": "String" } }` |
| **S14** | required=true 时不应有 default | `{ "title": { "required": true, "default": "" } }` | `{ "title": { "required": true } }` |
| **S15** | default 值类型必须匹配 type | `{ "count": { "type": "Number", "default": "" } }` | `{ "count": { "type": "Number", "default": 0 } }` |

---

## ComputedDefinition - 计算属性定义

### 结构定义

```typescript
interface ComputedDefinition {
  [key: string]: ComputedItemDefinition;
}

interface ComputedItemDefinition {
  getter: ExpressionValue | string;      // 必需：getter 函数
  setter?: ExpressionValue | string;      // 可选：setter 函数
}
```

### 计算属性规则

| 规则 ID | 规则 | 错误示例 | 正确示例 |
|---------|------|----------|----------|
| **S16** | getter 必需 | `{ "doubled": {} }` | `{ "doubled": { "getter": "{{ref_state_count * 2}}" } }` |
| **S17** | getter 必须是表达式或字符串 | `{ "doubled": { "getter": true } }` | `{ "doubled": { "getter": "{{ref_state_count * 2}}" } }` |
| **S18** | setter 只用于可写计算属性 | `{ "doubled": { "getter": "...", "setter": "..." } }` | 无 setter 的计算属性应省略 |

---

## MethodsDefinition - 方法定义

### 结构定义

```typescript
interface MethodsDefinition {
  [key: string]: FunctionValue;
}

interface FunctionValue {
  _type: 'function';
  params: Record<string, unknown>;       // 参数对象
  body: string;                          // 函数体代码
}
```

### 方法规则

| 规则 ID | 规则 | 错误示例 | 正确示例 |
|---------|------|----------|----------|
| **S19** | _type 必须是 'function' | `{ "submit": { "body": "..." } }` | `{ "submit": { "_type": "function", "params": {}, "body": "..." } }` |
| **S20** | params 必需（可为空对象） | `{ "submit": { "_type": "function", "body": "..." } }` | `{ "submit": { "_type": "function", "params": {}, "body": "..." } }` |
| **S21** | body 必需 | `{ "submit": { "_type": "function", "params": {} } }` | `{ "submit": { "_type": "function", "params": {}, "body": "return true" } }` |

---

## WatchDefinition - 监听器定义

### 结构定义

```typescript
interface WatchDefinition {
  [key: string]: WatchItemDefinition;
}

interface WatchItemDefinition {
  type: 'watch' | 'watchEffect';
  source?: ExpressionValue;               // watch 类型必需
  handler: FunctionValue;                 // watch 类型必需
  immediate?: boolean;
  deep?: boolean;
  flush?: 'pre' | 'post' | 'sync';
  effect?: FunctionValue;                 // watchEffect 类型必需
}
```

### 监听器规则

| 规则 ID | 规则 | 错误示例 | 正确示例 |
|---------|------|----------|----------|
| **S22** | watch 类型必须有 source 和 handler | `{ "countWatch": { "type": "watch" } }` | `{ "countWatch": { "type": "watch", "source": {...}, "handler": {...} } }` |
| **S23** | watchEffect 类型必须有 effect | `{ "effectWatch": { "type": "watchEffect" } }` | `{ "effectWatch": { "type": "watchEffect", "effect": {...} } }` |

---

## LifecycleDefinition - 生命周期钩子

### 支持的钩子

| 钩子 | Vue API | 执行时机 |
|------|---------|----------|
| `onMounted` | `onMounted()` | 组件挂载后 |
| `onUnmounted` | `onUnmounted()` | 组件卸载后 |
| `onUpdated` | `onUpdated()` | 组件更新后 |
| `onBeforeMount` | `onBeforeMount()` | 组件挂载前 |
| `onBeforeUnmount` | `onBeforeUnmount()` | 组件卸载前 |
| `onBeforeUpdate` | `onBeforeUpdate()` | 组件更新前 |
| `onErrorCaptured` | `onErrorCaptured()` | 捕获子组件错误 |
| `onActivated` | `onActivated()` | keep-alive 激活 |
| `onDeactivated` | `onDeactivated()` | keep-alive 停用 |

### 结构定义

```typescript
interface LifecycleDefinition {
  onMounted?: FunctionValue;
  onUnmounted?: FunctionValue;
  onUpdated?: FunctionValue;
  // ...其他钩子
}
```

---

## RenderDefinition - 渲染定义

### Template 渲染

```typescript
interface TemplateRenderDefinition {
  type: 'template';
  content: VNodeDefinition;              // 必需：VNode 定义
}
```

### Function 渲染

```typescript
interface FunctionRenderDefinition {
  type: 'function';
  body: string;                          // 必需：渲染函数代码
  params?: string[];                     // 可选：参数列表，默认 ['h', 'props', 'state', 'computed', 'methods']
}
```

### 渲染定义规则

```json
// 正确：template 渲染
{
  "render": {
    "type": "template",
    "content": {
      "type": "div",
      "children": "Hello"
    }
  }
}

// 正确：function 渲染
{
  "render": {
    "type": "function",
    "body": "return h('div', 'Hello')"
  }
}

// 错误 - 规则 S03 违反
{
  "render": {
    "type": "unknown"  // ❌ type 必须是 template 或 function
  }
}
```

---

## VNodeDefinition - 虚拟节点定义

### 结构定义

```typescript
interface VNodeDefinition {
  type: string | ComponentReference;     // 必需：元素类型或组件引用
  props?: Record<string, unknown>;       // 可选：元素属性
  children?: ChildrenDefinition;         // 可选：子节点
  directives?: VNodeDirectives;          // 可选：指令
  slots?: SlotsDefinition;               // 可选：插槽定义
}

type ChildrenDefinition = 
  | string 
  | ExpressionValue 
  | VNodeDefinition 
  | ChildrenDefinition[];

interface ComponentReference {
  _type: 'component';
  name: string;                          // 注册的组件名
}
```

### VNode 规则

| 规则 ID | 规则 | 错误示例 | 正确示例 |
|---------|------|----------|----------|
| **S24** | type 必需 | `{ "children": "Text" }` | `{ "type": "div", "children": "Text" }` |
| **S25** | 组件引用需要 _type | `{ "type": "MyComponent" }` | `{ "type": { "_type": "component", "name": "MyComponent" } }` |
| **S26** | HTML 元素直接用字符串 | `{ "type": { "_type": "component", "name": "div" } }` | `{ "type": "div" }` |

---

## StylesDefinition - 样式定义

### 结构定义

```typescript
interface StylesDefinition {
  css?: string;                          // CSS 字符串
  scoped?: boolean;                      // 是否 scoped，默认 true
}
```

### 样式规则

```json
// 正确示例
{
  "styles": {
    "css": ".container { padding: 16px; } .title { font-size: 14px; }",
    "scoped": true
  }
}

// 默认 scoped 为 true
{
  "styles": {
    "css": ".container { padding: 16px; }"
  }
}
```

---

## ComponentsDefinition - 本地组件注册

### 结构定义

```typescript
interface ComponentsDefinition {
  [key: string]: ComponentReference | VueJsonSchema;
}
```

### 组件注册规则

| 规则 ID | 规则 | 说明 |
|---------|------|------|
| **S27** | 本地组件必须注册 | 在 render 中使用的自定义组件必须在 components 中声明 |
| **S28** | 注册方式 | 可以引用已注册组件或内联定义 Schema |

```json
// 正确：引用已注册组件
{
  "components": {
    "ChildComponent": { "_type": "component", "name": "ChildComponent" }
  }
}

// 正确：内联定义 Schema
{
  "components": {
    "ChildComponent": {
      "name": "ChildComponent",
      "render": { "type": "template", "content": { "type": "span", "children": "Child" } }
    }
  }
}
```

---

## 规则汇总表

| 规则 ID | 字段 | 约束 |
|---------|------|------|
| S01 | name | 必需，唯一标识符 |
| S02 | render | 必需 |
| S03 | render.type | 必须是 'template' 或 'function' |
| S04 | template.content | 必需 |
| S05 | function.body | 必需 |
| S06 | ref.initial | 原始值类型 |
| S07 | reactive.initial | 对象或数组 |
| S08 | shallowRef.initial | 任意值（浅响应） |
| S09 | shallowReactive.initial | 对象（浅响应） |
| S10 | toRef | 需要 source + property |
| S11 | toRefs | 需要 source |
| S12 | readonly | 需要响应式源 |
| S13 | props.type | Vue prop 类型（大写） |
| S14 | props.required + default | 不应同时存在 |
| S15 | props.default | 类型匹配 |
| S16 | computed.getter | 必需 |
| S17 | computed.getter | 表达式或字符串 |
| S18 | computed.setter | 仅用于可写计算属性 |
| S19 | methods._type | 必须是 'function' |
| S20 | methods.params | 必需 |
| S21 | methods.body | 必需 |
| S22 | watch (type) | 需要 source + handler |
| S23 | watchEffect | 需要 effect |
| S24 | VNode.type | 必需 |
| S25 | ComponentReference | 需要 _type: 'component' |
| S26 | HTML 元素 | 直接字符串 |
| S27 | components | 自定义组件必须注册 |
| S28 | 组件注册方式 | 引用或内联 Schema |