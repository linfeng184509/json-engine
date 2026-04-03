# @json-engine/vue-json

> JSON 驱动的 Vue 3 渲染引擎 — 将声明式 JSON Schema 动态编译为可交互的 Vue 组件

## 概述

`@json-engine/vue-json` 是一个基于 Vue 3 的 JSON Schema 渲染引擎。它接收描述组件结构的 JSON Schema，通过解析、编译、运行时求值，在浏览器中动态生成完整的 Vue 组件。整个流程无需手写 `.vue` 文件，所有组件逻辑、状态、样式均可通过 JSON 描述。

**核心特性：**
- 完整的 Vue 3 组件选项映射：`props`、`emits`、`state`、`computed`、`methods`、`watch`、`provide`/`inject`、`lifecycle`
- 两种渲染模式：`template`（声明式 VNode 树）和 `function`（编程式渲染）
- 完整的指令系统：`v-if`、`v-show`、`v-for`、`v-model`、`v-on`、`v-bind`、`v-html`、`v-text`、`v-slot`
- 插件系统：支持动态注册组件、值类型、作用域扩展、运行时导出
- CoreScope 服务容器：内置 API 调用、路由、存储、国际化、权限、WebSocket 等能力
- Schema 远程加载与缓存
- TypeScript 类型生成

## 安装

```bash
npm install @json-engine/vue-json
```

**Peer 依赖：** `vue ^3.4.0`

## 快速开始

### 方式一：直接创建组件

```typescript
import { createComponent } from '@json-engine/vue-json';

const schema = {
  name: 'Counter',
  state: {
    count: { type: 'ref', initial: 0 }
  },
  methods: {
    increment: { $fn: '$state.count++' },
    decrement: { $fn: '$state.count--' }
  },
  render: {
    type: 'template',
    content: {
      type: 'div',
      children: [
        { type: 'span', children: [{ $expr: '$state.count' }] },
        { type: 'AButton', props: { type: 'primary' }, directives: { vOn: { click: { $fn: 'methods.increment()' } } }, children: ['+'] },
        { type: 'AButton', directives: { vOn: { click: { $fn: 'methods.decrement()' } } }, children: ['-'] }
      ]
    }
  }
};

const Counter = createComponent(schema);
```

### 方式二：使用 Composable

```vue
<script setup>
import { useVueJson } from '@json-engine/vue-json';

const { component, parse, error, isLoading } = useVueJson();

// 动态解析 Schema
parse({
  name: 'HelloWorld',
  state: { message: { type: 'ref', initial: 'Hello' } },
  render: {
    type: 'template',
    content: {
      type: 'h1',
      children: [{ $expr: '$state.message' }]
    }
  }
});
</script>

<template>
  <component :is="component" />
</template>
```

### 方式三：PageLoader 远程加载

```vue
<script setup>
import { PageLoader } from '@json-engine/vue-json';
</script>

<template>
  <PageLoader schema-path="/schemas/pages/home.json" />
</template>
```

## Schema 结构

一个完整的 `VueJsonSchema` 包含以下部分：

```typescript
interface VueJsonSchema {
  name: string;           // 组件名称（必填）
  props?: PropsDefinition;
  emits?: EmitsDefinition;
  state?: StateDefinition;
  computed?: ComputedDefinition;
  methods?: MethodsDefinition;
  watch?: WatchDefinition;
  provide?: ProvideDefinition;
  inject?: InjectDefinition;
  lifecycle?: LifecycleDefinition;
  components?: ComponentsDefinition;
  render: RenderDefinition;  // 渲染树（必填）
  styles?: StylesDefinition;
}
```

### 1. `props` — 组件属性

定义组件接收的外部属性，映射为 Vue 的 `ComponentObjectPropsOptions`。

```json
{
  "props": {
    "title": { "type": "String", "required": true },
    "count": { "type": "Number", "default": 0 },
    "items": { "type": "Array" },
    "config": {
      "type": "Object",
      "default": { "$expr": "{ mode: 'default' }" }
    },
    "validator": {
      "type": "String",
      "validator": { "$fn": "return value.length > 0" }
    }
  }
}
```

`type` 支持：`String`、`Number`、`Boolean`、`Array`、`Object`、`Function`、`Symbol`、`BigInt`。

### 2. `emits` — 组件事件

定义组件可触发的事件。

```json
{
  "emits": {
    "change": { "type": "Number" },
    "submit": {
      "validator": { "$fn": "return args[0] && args[0].id" }
    }
  }
}
```

### 3. `state` — 响应式状态

定义组件内部的响应式数据，支持 Vue 3 的所有响应式 API。

```json
{
  "state": {
    "count": { "type": "ref", "initial": 0 },
    "user": { "type": "reactive", "initial": { "name": "", "age": 0 } },
    "formRef": { "type": "shallowRef" },
    "readOnly": { "type": "readonly", "source": "state.user" },
    "userName": { "type": "toRef", "source": "state.user", "key": "name" }
  }
}
```

| type | 说明 | 初始值 |
|------|------|--------|
| `ref` | `ref(initial)` | `initial` 字段 |
| `reactive` | `reactive(obj)` | `initial` 字段（必须为对象） |
| `shallowRef` | `shallowRef(initial)` | `initial` 字段 |
| `shallowReactive` | `shallowReactive(obj)` | `initial` 字段 |
| `toRef` | `toRef(source, key)` | `source` + `key` 字段 |
| `toRefs` | `toRefs(source)`（展开到 state） | `source` 字段 |
| `readonly` | `readonly(source)` | `source` 字段 |

`source` 可为 `"props"` 或 `"state.xxx"`。

### 4. `computed` — 计算属性

支持只读和可写计算属性。

```json
{
  "computed": {
    "double": {
      "get": { "$fn": "return $state.count * 2" }
    },
    "fullName": {
      "get": { "$fn": "return $props.firstName + ' ' + $props.lastName" },
      "set": { "$fn": "var parts = args[0].split(' '); $props.firstName = parts[0]; $props.lastName = parts[1];" }
    }
  }
}
```

### 5. `methods` — 方法

定义组件方法，通过 `$fn` 关键字声明。

```json
{
  "methods": {
    "handleClick": { "$fn": "console.log('clicked', $event)" },
    "submit": {
      "$fn": {
        "params": ["formData"],
        "body": "$_core._api.post('/api/submit', formData)"
      }
    },
    "calculate": { "$fn": "return $state.a + $state.b" }
  }
}
```

### 6. `watch` — 侦听器

支持 `watch` 和 `watchEffect` 两种模式。

```json
{
  "watch": {
    "watchCount": {
      "source": { "$expr": "$state.count" },
      "handler": { "$fn": "console.log('count changed to', args[0], 'from', args[1])" },
      "immediate": true,
      "deep": false,
      "flush": "post"
    },
    "autoEffect": {
      "source": { "$expr": "$state.count" },
      "handler": { "$fn": "document.title = 'Count: ' + $state.count" },
      "type": "effect"
    }
  }
}
```

### 7. `provide` / `inject` — 依赖注入

```json
{
  "provide": {
    "items": [
      { "key": "theme", "value": { "$expr": "'dark'" } }
    ]
  },
  "inject": {
    "items": [
      { "key": "theme", "default": "light" },
      { "key": "locale", "from": "appLocale", "default": "en" }
    ]
  }
}
```

### 8. `lifecycle` — 生命周期钩子

支持 Vue 3 的全部 9 个生命周期钩子，每个可以是单个函数或函数数组。

```json
{
  "lifecycle": {
    "onMounted": { "$fn": "console.log('mounted')" },
    "onUnmounted": [
      { "$fn": "console.log('cleanup 1')" },
      { "$fn": "console.log('cleanup 2')" }
    ],
    "onErrorCaptured": { "$fn": "console.error('error:', args[0])" }
  }
}
```

支持的钩子：`onMounted`、`onUnmounted`、`onUpdated`、`onBeforeMount`、`onBeforeUnmount`、`onBeforeUpdate`、`onErrorCaptured`、`onActivated`、`onDeactivated`。

### 9. `components` — 局部组件

支持本地组件和异步组件。

```json
{
  "components": {
    "MyLocalComp": {
      "type": "local",
      "source": "{ \"name\": \"MyLocalComp\", \"render\": { ... } }"
    },
    "AsyncComp": {
      "type": "async",
      "source": "./components/AsyncComp.json",
      "loadingComponent": "LoadingSpinner",
      "errorComponent": "ErrorFallback",
      "delay": 200,
      "timeout": 3000
    }
  }
}
```

### 10. `render` — 渲染树

两种渲染模式：

#### 模式一：`template`（声明式 VNode 树）

```json
{
  "render": {
    "type": "template",
    "content": {
      "type": "div",
      "props": { "class": "container" },
      "children": [
        { "type": "h1", "children": [{ "$expr": "$props.title" }] },
        { "type": "p", "children": ["Hello World"] }
      ]
    }
  }
}
```

#### 模式二：`function`（编程式渲染）

```json
{
  "render": {
    "type": "function",
    "content": {
      "$fn": "return h('div', { class: 'container' }, [h('h1', null, props.title)])"
    }
  }
}
```

`function` 模式下，`new Function` 接收 `h`、`props`、`state`、`computed`、`methods`、`emit`、`slots`、`attrs`、`provide` 共 9 个参数。

### 11. `styles` — 样式注入

```json
{
  "styles": {
    "scoped": true,
    "css": ".container { padding: 16px; }"
  }
}
```

`scoped: true` 时自动添加 `[data-v-{componentId}]` 属性选择器实现样式隔离。

## VNode 定义

`template` 模式下的每个节点遵循以下结构：

```typescript
interface VNodeDefinition {
  type: string;              // HTML 标签名或组件名
  props?: Record<string, PropertyValue>;
  children?: VNodeChildren;
  directives?: VNodeDirectives;
  key?: string | number;
  ref?: string;
}
```

### 指令系统

| 指令 | 格式 | 说明 |
|------|------|------|
| `v-if` | `{ "vIf": { "$expr": "condition" } }` | 条件渲染，falsy 时返回 null |
| `v-show` | `{ "vShow": { "$expr": "visible" } }` | 条件显示，falsy 时添加 `display: none` |
| `v-for` | `{ "vFor": { "source": { "$expr": "items" }, "alias": "item", "index": "i" } }` | 列表渲染 |
| `v-model` | `{ "vModel": { "prop": { "$ref": "state.value" } } }` | 双向绑定，支持 StateRef/PropsRef |
| `v-on` | `{ "vOn": { "click": { "$fn": "methods.handleClick()" } } }` | 事件绑定，支持 `.prevent`、`.stop` 修饰符 |
| `v-bind` | `{ "vBind": { "class": { "$expr": "cls" } } }` | 动态属性绑定 |
| `v-html` | `{ "vHtml": { "$expr": "htmlContent" } }` | 设置 innerHTML |
| `v-text` | `{ "vText": { "$expr": "textContent" } }` | 设置 textContent |
| `v-slot` | `{ "vSlot": { "name": "header" } }` | 具名插槽/作用域插槽 |

#### `v-for` 示例

```json
{
  "type": "li",
  "directives": {
    "vFor": {
      "source": { "$expr": "$state.items" },
      "alias": "item",
      "index": "index"
    }
  },
  "children": [{ "$expr": "item.name + ' (' + index + ')'" }]
}
```

#### `v-model` 示例

```json
{
  "type": "AInput",
  "directives": {
    "vModel": {
      "prop": { "$ref": "state.searchText" }
    }
  }
}
```

#### `v-on` 修饰符

```json
{
  "type": "form",
  "directives": {
    "vOn": {
      "submit.prevent": { "$fn": "methods.handleSubmit()" }
    }
  }
}
```

#### 插槽

```json
{
  "type": "ACard",
  "children": [
    {
      "type": "template",
      "directives": {
        "vSlot": { "name": "title" }
      },
      "children": [{ "type": "h3", "children": ["Card Title"] }]
    },
    {
      "type": "template",
      "directives": {
        "vSlot": { "name": "default" }
      },
      "children": [{ "type": "p", "children": ["Card content"] }]
    }
  ]
}
```

## 表达式与函数

### `$expr` — 表达式求值

表达式通过 `new Function()` 执行，可访问以下变量：

| 变量 | 说明 |
|------|------|
| `props` | 组件属性 |
| `state` | 响应式状态（自动解包 `.value`） |
| `computed` | 计算属性（自动解包 `.value`） |
| `methods` | 组件方法 |
| `emit` | 事件触发函数 |
| `slots` | 插槽对象 |
| `attrs` | 透传属性 |
| `provide` | 注入的值 |
| `coreScope` | 服务容器 |

```json
{ "$expr": "$state.count > 0 ? 'active' : 'inactive'" }
{ "$expr": "$props.title || 'Default Title'" }
{ "$expr": "$_core._i18n.t('hello')" }
```

### `$fn` — 函数定义

函数体通过 `new Function()` 执行，额外接收 `args` 参数（调用时传入的参数数组）。

```json
// 简写
{ "$fn": "$state.count++" }

// 带参数
{
  "$fn": {
    "params": ["event", "data"],
    "body": "console.log(event, data); $state.lastEvent = event;"
  }
}
```

**函数体内的快捷变量：**

| 写法 | 转换为 |
|------|--------|
| `$event` | `args[0]` |
| `$state` | `state` |
| `$props` | `props` |
| `$computed` | `computed` |
| `$_core.xxx` | `coreScope._xxx` |

### `$ref` — 数据引用

```json
{ "$ref": "state.count" }
{ "$ref": "props.userId" }
{ "$ref": "computed.totalPrice" }
{ "$ref": "state.user.profile.email" }
```

解析后自动解包 ref 的 `.value`，支持嵌套路径访问。

## CoreScope 服务容器

`CoreScope` 是在表达式和方法中可通过 `$_core.xxx` 访问的全局服务容器：

| 服务 | 访问方式 | 能力 |
|------|----------|------|
| `_api` | `$_core._api` | HTTP 请求（`get`、`post`、`put`、`delete`，基于 `fetch`） |
| `_router` | `$_core._router` | 路由导航（`push`、`replace`、`go`、`back`、`forward`） |
| `_storage` | `$_core._storage` | 键值存储（`get`、`set`、`remove`、`has`） |
| `_i18n` | `$_core._i18n` | 国际化（`t`、`locale`、`setLocale`、`getLocale`） |
| `_auth` | `$_core._auth` | 权限校验（`has`、`hasAny`、`hasAll`、`hasRole`、`canAccessPage`） |
| `_ws` | `$_core._ws` | WebSocket（`send`、`subscribe`、`unsubscribe`、`connect`、`disconnect`） |
| `_loader` | `$_core._loader` | Schema 加载器（`load`、`clearCache`、`preload`） |
| `_pinia` | `$_core._pinia` | Pinia 状态管理（Map 形式） |

### 替换 CoreScope 实现

默认实现为轻量级桩。可通过 `setCoreScope()` 替换为真实实现：

```typescript
import { setCoreScope, createCoreScope } from '@json-engine/vue-json';

const customScope = createCoreScope();
customScope._api = {
  get: async (url) => { /* 使用 axios */ },
  post: async (url, data) => { /* 使用 axios */ },
  // ...
};

setCoreScope(customScope);
```

## 插件系统

### 插件接口

```typescript
interface VueJsonPlugin {
  name: string;
  version: string;
  configSchema?: object;
  valueTypes?: ValueTypeDefinition[];       // 自定义值类型
  components?: PluginComponentDefinition[];  // 注册组件
  scopeExtensions?: ScopeExtension[];        // 扩展 CoreScope
  runtimeExports?: RuntimeExport[];          // 运行时导出
  onInstall?: (context) => void | Promise<void>;
  onUninstall?: () => void | Promise<void>;
}
```

### 注册插件

```typescript
import { getPluginRegistry, loadAndInstallPlugins } from '@json-engine/vue-json';

// 手动注册
const registry = getPluginRegistry();
registry.register(myPlugin);
await registry.install('my-plugin', { /* config */ });

// 从 Schema 声明动态加载安装
await loadAndInstallPlugins(
  [{ name: '@json-engine/plugin-antd', version: '0.0.1' }],
  { antd: { /* ant-design-vue config */ } }
);
```

### 插件提供的能力

| 能力 | 说明 |
|------|------|
| `valueTypes` | 注册自定义值类型解析器（如 `echarts-option`） |
| `components` | 注册全局可用的 Vue 组件 |
| `scopeExtensions` | 扩展 `$_core` 服务容器（如 `$_core._antd`） |
| `runtimeExports` | 导出运行时函数供外部调用 |
| `onInstall` | 安装钩子，可执行初始化逻辑 |

## API 参考

### 核心 API

#### `createComponent(schema, options?)`

从 Schema 创建 Vue 组件。

```typescript
function createComponent(
  schema: VueJsonSchemaInput,
  options?: ComponentCreatorOptions
): Component
```

**选项：**

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `cache` | `boolean` | `true` | 是否缓存组件（LRU，最大 500 条） |
| `injectStyles` | `boolean` | `true` | 是否注入 `styles` 中的 CSS |
| `debug` | `boolean` | `false` | 是否打印调试信息 |
| `extraComponents` | `Record<string, Component>` | `{}` | 额外可用的组件映射 |

#### `parseSchema(input)`

解析 Schema 输入（字符串或对象），返回 `ParseResult<ParsedSchema>`。

```typescript
const result = parseSchema(schemaJson);
if (result.success) {
  console.log(result.data.name);
} else {
  console.error(result.errors);
}
```

#### `renderVNode(definition, context)`

将 VNode 定义渲染为 Vue VNode。内部使用，也可用于自定义渲染。

### Composables

#### `useVueJson(options?)`

完整的响应式 Schema 解析器。

```typescript
const { component, schema, parse, error, isLoading } = useVueJson({
  cache: true,
  onError: (err) => console.error(err),
});

parse(schemaInput);
```

#### `useJsonComponent(options?)`

轻量组件工厂。

```typescript
const { create, clearCache } = useJsonComponent({ cache: true });
const MyComp = create(schemaInput);
```

#### `useJsonRenderer(component, options?)`

渲染器生命周期管理。

```typescript
const { destroy } = useJsonRenderer(component, { componentId: 'my-comp' });
destroy(); // 清理组件引用和样式
```

### Schema 加载

#### `loadComponent(path, options?)`

从 URL 加载 Schema 并创建组件。

```typescript
const result = await loadComponent('/schemas/pages/home.json', {
  cache: true,
  extraComponents: { MyComponent },
});

if (result.success) {
  // result.component
}
```

#### `preloadSchemas(paths, options?)`

预加载多个 Schema。

```typescript
const results = await preloadSchemas([
  '/schemas/pages/home.json',
  '/schemas/pages/about.json',
]);
```

### 平台检测

```typescript
import { getPlatform, isMobileDevice, getPlatformFeatures } from '@json-engine/vue-json';

const platform = getPlatform();  // 'pc-browser' | 'pc-client' | 'pda' | 'pad'
const isMobile = isMobileDevice();
const features = getPlatformFeatures();
```

### TypeScript 类型生成

```typescript
import { generateTypes, writeTypeDefinition, inferSchemaType } from '@json-engine/vue-json';

// 从 Schema 生成 TypeScript 类型定义字符串
const types = generateTypes(schema);

// 写入文件
writeTypeDefinition(schema, './types/schema.d.ts');

// 推断类型对象
const typeObj = inferSchemaType(schema);
```

### 全局组件注册

```typescript
import { registerGlobalComponents } from '@json-engine/vue-json';
import MyComponent from './MyComponent.vue';

registerGlobalComponents({ MyComponent });
// 之后所有 Schema 中可直接使用 type: 'MyComponent'
```

## 架构

```
JSON Schema 输入
       │
       ▼
┌─────────────────────────────────┐
│           解析层 (parser)        │
│                                 │
│  parseSchema()                  │
│  ├─ parseJson()  (core-engine)  │  解析 $ref/$expr/$fn/$scope
│  ├─ parseProps()                │  转换为 Vue props 选项
│  ├─ parseState()                │  验证 state 定义
│  ├─ parseComputed()             │  验证 computed 定义
│  ├─ parseMethods()              │  验证 methods 定义
│  ├─ parseWatch()                │  验证 watch 定义
│  ├─ parseLifecycle()            │  验证 lifecycle 定义
│  ├─ parseComponents()           │  验证 components 定义
│  └─ parseRender()               │  验证 VNode 树结构
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│          运行时层 (runtime)       │
│                                 │
│  createComponentCreator()       │
│  ├─ createState()               │  创建 ref/reactive/shallowRef...
│  ├─ createStateProxy()          │  Proxy 自动解包 .value
│  ├─ createComputed()            │  创建 computed（new Function）
│  ├─ createMethods()             │  创建方法包装器
│  ├─ setupWatchers()             │  设置 watch/watchEffect
│  ├─ setupLifecycle()            │  注册生命周期钩子
│  ├─ setupProvide/Inject()       │  设置依赖注入
│  └─ render function             │  调用 renderVNode()
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│          渲染层 (render)          │
│                                 │
│  renderVNode()                  │
│  ├─ 指令处理 (v-if/v-for/v-show) │
│  ├─ 组件解析                    │
│  ├─ 插槽解析 (具名/作用域)        │
│  ├─ resolveNodeProps()          │  解析 props + v-bind/v-model/v-on
│  ├─ resolveNodeChildren()       │  解析子节点 + v-html/v-text
│  └─ h() 调用                    │  生成 Vue VNode
└─────────────────────────────────┘
```

## 项目结构

```
src/packages/vue-json/
├── src/
│   ├── index.ts                    # 公共 API 导出
│   ├── types/
│   │   ├── schema.ts               # 核心 Schema 类型定义
│   │   ├── runtime.ts              # 运行时类型（RenderContext、SetupContext 等）
│   │   ├── app.ts                  # 应用级类型（VueJsonAppSchema、PluginConfig 等）
│   │   ├── plugin.definitions.ts   # 插件系统类型
│   │   └── platform.ts             # 平台检测类型
│   ├── parser/
│   │   ├── index.ts                # parseSchema() 主入口
│   │   ├── props-parser.ts         │
│   │   ├── emits-parser.ts         │
│   │   ├── state-parser.ts         │
│   │   ├── computed-parser.ts      │
│   │   ├── methods-parser.ts       │  各 Section 解析器
│   │   ├── watch-parser.ts         │
│   │   ├── lifecycle-parser.ts     │
│   │   ├── provide-inject-parser.ts│
│   │   ├── components-parser.ts    │
│   │   ├── render-parser.ts        │
│   │   └── key-parsers.ts          # 键名转换器（toPascalCase、变量名校验）
│   ├── config/
│   │   └── vue-parser-config.ts    # Vue 专用的 core-engine 解析配置
│   ├── runtime/
│   │   ├── component-creator.ts    # 组件创建核心（createComponentCreator）
│   │   ├── state-factory.ts        # 状态工厂（createState + createStateProxy）
│   │   ├── computed-factory.ts     # 计算属性工厂
│   │   ├── watch-factory.ts        # 侦听器工厂
│   │   ├── lifecycle-factory.ts    # 生命周期工厂
│   │   ├── render-factory.ts       # VNode 渲染器（renderVNode）
│   │   ├── directive-runtime.ts    # 指令运行时（v-if/v-for/v-model/v-on/...）
│   │   ├── value-resolver.ts       # 值解析与表达式求值引擎
│   │   ├── provide-inject.ts       # provide/inject 运行时
│   │   ├── style-injector.ts       # CSS 注入与样式隔离
│   │   ├── schema-loader.ts        # 远程 Schema 加载与缓存
│   │   ├── app-factory.ts          # 应用级 Schema 加载与验证
│   │   ├── platform-detector.ts    # 平台检测（PC/PDA/PAD）
│   │   └── multi-platform-config.ts│ 多平台配置
│   ├── plugin/
│   │   ├── plugin-registry.ts      # 插件注册表（PluginRegistry）
│   │   └── index.ts
│   ├── composables/
│   │   ├── use-core-scope.ts       # CoreScope 服务容器
│   │   └── index.ts                # useVueJson / useJsonComponent / useJsonRenderer
│   ├── components/
│   │   ├── PageLoader.ts           # 远程 Schema 加载组件
│   │   ├── Slot.ts                 # 插槽组件
│   │   └── index.ts
│   └── utils/
│       ├── error.ts                # 错误类型（SchemaParseError、ExpressionError 等）
│       ├── expression.ts           # 表达式工具
│       └── type-generator.ts       # TypeScript 类型生成器
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 与 core-engine 的关系

`@json-engine/vue-json` 依赖 `@json-engine/core-engine` 完成底层 DSL 解析：

- `parseJson()` — 递归遍历 JSON，识别并转换 `$ref`/`$expr`/`$fn`/`$scope`
- `createParserConfig()` — 构建解析配置
- `ValueReferenceParser` — 解析引用字符串
- `isExpressionParseData` / `isFunctionParseData` / `isReferenceParseData` / `isScopeParseData` — 类型守卫
- `createParserCache` — LRU 缓存

vue-json 在此基础上扩展了 Vue 专属的解析器（props、state、computed、methods 等）和完整的运行时渲染引擎。
