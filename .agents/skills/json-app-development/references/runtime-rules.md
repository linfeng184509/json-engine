# Runtime Rules - 运行时执行规则

本文档定义运行时上下文、值解析、表达式执行和组件创建流程规则。

---

## RenderContext 结构

```typescript
interface RenderContext {
  props: Record<string, unknown>;                    // 组件属性
  state: Record<string, Ref | Reactive<unknown>>;   // 响应式状态
  computed: Record<string, ComputedRef<unknown>>;   // 计算属性
  methods: Record<string, (...args: unknown[]) => unknown>;  // 方法
  components: Record<string, Component>;            // 组件注册表
  slots: Slots;                                     // 插槽
  emit: EmitFn;                                     // 事件触发函数
  attrs: Record<string, unknown>;                   // 未声明的属性
  provide: Record<string, unknown>;                 // 提供的 context
  stateTypes?: Record<string, StateType>;           // 状态类型记录
  coreScope?: Record<string, unknown>;              // CoreScope 扩展
}
```

---

## 运行时执行规则

### 规则 ID | 描述

| ID | 规则 |
|----|------|
| **RT01** | `props` 是只读的，不能在运行时修改 |
| **RT02** | `state` 根据类型决定是否需要 `.value` |
| **RT03** | `computed` 需要 `.value` 访问值 |
| **RT04** | `methods` 是普通函数，直接调用 |
| **RT05** | `emit` 用于触发自定义事件 |
| **RT06** | `coreScope` 扩展由插件提供 |

---

## 状态访问规则

### StateType 与访问方式

| StateType | 表达式中 | 函数体内 | 说明 |
|-----------|----------|----------|------|
| `ref` | 自动 `.value` | 需手动 `.value` | 原始值响应式 |
| `reactive` | 直接访问 | 直接访问 | 对象响应式 |
| `shallowRef` | 自动 `.value` | 需手动 `.value` | 浅响应原始值 |
| `shallowReactive` | 直接访问 | 直接访问 | 浅响应对象 |
| `readonly` | 自动处理 | 自动处理 | 只读包装 |
| `toRef` | 自动处理 | 需手动 `.value` | 引用属性 |
| `toRefs` | 自动处理 | 需手动 `.value` | 对象解构 |

### 访问示例

```json
{
  "state": {
    "count": { "type": "ref", "initial": 0 },
    "form": { "type": "reactive", "initial": { "name": "" } }
  },
  
  // 表达式中：自动处理
  "computed": {
    "doubled": { "getter": "{{ref_state_count * 2}}" },  // 自动 state.count.value
    "formName": { "getter": "{{ref_state_form.name}}" }  // 自动 state.form.name
  },
  
  // 函数体内：需手动判断
  "methods": {
    "increment": {
      "_type": "function",
      "params": {},
      "body": "state.count.value++"  // ref 类型需 .value
    },
    "updateName": {
      "_type": "function",
      "params": { "name": "" },
      "body": "state.form.name = name"  // reactive 直接访问
    }
  }
}
```

---

## 值解析流程

### resolvePropertyValue

```
输入: 属性值 + RenderContext
    │
    ▼
判断值类型
    │
    ├─ 静态值 → 直接返回
    │
    ├─ ExpressionValue → evaluateExpression()
    │   │
    │   ├─ 包含 ref_state → state.xxx.value / state.xxx
    │   ├─ 包含 ref_props → props.xxx
    │   ├─ 包含 ref_computed → computed.xxx.value
    │   ├─ 包含 $_core_ → coreScope.xxx
    │   └─ 纯表达式 → 执行计算
    │
    ├─ ReferenceValue → 解析引用
    │   │
    │   ├─ prefix: state → state.xxx
    │   ├─ prefix: props → props.xxx
    │   └─ prefix: computed → computed.xxx.value
    │
    ├─ FunctionValue → executeFunction()
    │   │
    │   ├─ 绑定参数
    │   ├─ 转换 body 中的引用
    │   └─ 执行函数体
    │
    ▼
返回解析后的值
```

---

## 表达式执行规则

### evaluateExpression

**规则 ID | 描述**

| ID | 规则 |
|----|------|
| **E01** | 表达式必须是有效的 JavaScript 表达式 |
| **E02** | 表达式中的引用会被自动转换 |
| **E03** | 表达式在 RenderContext 上下文中执行 |
| **E04** | 表达式可以是单个引用或复杂运算 |

**转换规则**:

| 表达式模式 | 转换结果 |
|------------|----------|
| `{{ref_state_x}}` (ref) | `state.x.value` |
| `{{ref_state_x}}` (reactive) | `state.x` |
| `{{ref_props_x}}` | `props.x` |
| `{{ref_computed_x}}` | `computed.x.value` |
| `{{$_core_x}}` | `coreScope.x` |
| `{{ref_state_x + 1}}` | `state.x.value + 1` |
| `{{ref_state_x.prop}}` | `state.x.prop` (reactive) / `state.x.value.prop` (ref) |

**执行示例**:

```json
{
  "state": {
    "a": { "type": "ref", "initial": 1 },
    "b": { "type": "ref", "initial": 2 }
  },
  
  // 简单引用
  "computed": {
    "valueA": { "getter": "{{ref_state_a}}" }  // → state.a.value
  },
  
  // 运算表达式
  "computed": {
    "sum": { "getter": "{{ref_state_a + ref_state_b}}" }  // → state.a.value + state.b.value
  },
  
  // 条件表达式
  "computed": {
    "status": { "getter": "{{ref_state_a > 0 ? 'positive' : 'negative'}}" }
  },
  
  // 方法调用
  "computed": {
    "formatted": { "getter": "{{String(ref_state_a).padStart(3, '0')}}" }
  }
}
```

---

## 函数执行规则

### executeFunction

**规则 ID | 描述**

| ID | 规则 |
|----|------|
| **F01** | 函数体必须是有效的 JavaScript 代码 |
| **F02** | 函数体内的引用保持原样（需手动处理） |
| **F03** | 函数可以访问 RenderContext 的所有属性 |
| **F04** | 函数可以有 return 语句 |
| **F05** | 异步函数需要 async 标识 |

**函数体访问规则**:

| 访问目标 | 函数体内语法 | 说明 |
|----------|--------------|------|
| State (ref) | `state.xxx.value` | 需要手动 `.value` |
| State (reactive) | `state.xxx` | 直接访问 |
| Props | `props.xxx` | 直接访问 |
| Computed | `computed.xxx.value` | 需要 `.value` |
| Methods | `methods.xxx()` | 直接调用 |
| CoreScope | `coreScope.xxx` | 直接访问 |
| Emit | `emit('event', data)` | 触发事件 |

**函数示例**:

```json
{
  "state": {
    "count": { "type": "ref", "initial": 0 },
    "form": { "type": "reactive", "initial": { "name": "" } }
  },
  
  "methods": {
    // 修改 ref 类型 state
    "increment": {
      "_type": "function",
      "params": {},
      "body": "state.count.value++"
    },
    
    // 修改 reactive 类型 state
    "updateForm": {
      "_type": "function",
      "params": { "name": "" },
      "body": "state.form.name = name"
    },
    
    // 访问 computed
    "logDoubled": {
      "_type": "function",
      "params": {},
      "body": "console.log(computed.doubled.value)"
    },
    
    // 调用其他方法
    "reset": {
      "_type": "function",
      "params": {},
      "body": "state.count.value = 0; methods.updateForm('')"
    },
    
    // 异步函数
    "loadData": {
      "_type": "function",
      "params": {},
      "body": "coreScope._api.get('/data').then(res => { state.data.value = res })"
    },
    
    // 有返回值
    "getValue": {
      "_type": "function",
      "params": {},
      "body": "return state.count.value"
    },
    
    // 触发事件
    "notify": {
      "_type": "function",
      "params": { "message": "" },
      "body": "emit('notification', { message })"
    }
  }
}
```

---

## 组件创建流程

### createComponent

```
输入: VueJsonSchema
    │
    ▼
parseSchema(schema, config)
    │
    ├─ 验证 name 存在
    ├─ 验证 render 存在
    ├─ 使用 core-engine parseJson()
    ├─ 应用 valueParsers
    │
    ▼
ParsedSchema
    │
    ▼
createComponentCreator(parsedSchema)
    │
    ├─ 检查缓存（componentCache）
    │   │
    │   ├─ 存在 → 返回缓存组件
    │   │
    │   └─ 不存在 → 创建新组件
    │
    ▼
defineComponent({
  name: parsedSchema.name,
  props: resolveProps(parsedSchema.props),
  emits: parsedSchema.emits,
  
  setup(props, context) {
    // 创建 state
    const state = createState(parsedSchema.state, context);
    
    // 创建 computed
    const computed = createComputed(parsedSchema.computed, context, state);
    
    // 创建 methods
    const methods = createMethods(parsedSchema.methods, context, state, computed);
    
    // 设置 watch
    setupWatchers(parsedSchema.watch, context, state, computed, methods);
    
    // 设置 lifecycle
    setupLifecycle(parsedSchema.lifecycle, context, state, computed, methods);
    
    // 构建 RenderContext
    const renderContext: RenderContext = {
      props,
      state,
      computed,
      methods,
      components: resolveComponents(parsedSchema.components),
      slots: context.slots,
      emit: context.emit,
      attrs: context.attrs,
      coreScope: getCoreScope()
    };
    
    // 返回渲染函数
    return () => renderVNode(parsedSchema.render, renderContext);
  }
})
    │
    ▼
Vue Component
```

---

## 渲染流程

### renderVNode

```
输入: RenderDefinition + RenderContext
    │
    ├─ type: 'template'
    │   │
    │   ▼
    │   resolveVNode(content, context)
    │   │
    │   ├─ resolveNodeType → HTML 元素或组件
    │   ├─ resolveNodeProps → 属性解析 + 指令处理
    │   ├─ resolveNodeChildren → 子节点解析
    │   │
    │   ▼
    │   h(nodeType, nodeProps, nodeChildren)
    │
    ├─ type: 'function'
    │   │
    │   ▼
    │   执行渲染函数体
    │   │
    │   ├─ 绑定参数 (h, props, state, computed, methods)
    │   ├─ 执行 body
    │   │
    │   ▼
    │   返回 VNode
    │
    ▼
输出 VNode
```

---

## 指令运行时处理

### 指令执行顺序

| 优先级 | 指令 | 处理时机 |
|--------|------|----------|
| 1 | `vIf` | 渲染前，条件为 false 则不渲染 |
| 2 | `vFor` | 渲染前，生成多个 VNode |
| 3 | `vOnce` | 渲染时，标记静态 |
| 4 | `vBind` | 属性解析时 |
| 5 | `vModel` | 属性解析时 + 事件绑定 |
| 6 | `vOn` | 属性解析时 |
| 7 | `vShow` | 属性解析时，设置 style.display |
| 8 | `vHtml` | 子节点解析时 |
| 9 | `vText` | 子节点解析时 |
| 10 | `vSlot` | 子节点解析时 |

### applyVIf

```typescript
function applyVIf(vIf: ExpressionValue, context: RenderContext): boolean {
  const result = evaluateExpression(vIf.expression, context);
  return Boolean(result);
}
```

**规则**: 返回 false 时整个 VNode 不渲染。

### applyVFor

```typescript
function applyVFor(
  vFor: VForDirective, 
  context: RenderContext, 
  vnodeTemplate: VNodeDefinition
): VNode[] {
  const source = evaluateExpression(vFor.source.expression, context);
  const alias = vFor.alias;
  const index = vFor.index;
  
  if (!Array.isArray(source)) return [];
  
  return source.map((item, i) => {
    const extendedContext = {
      ...context,
      [alias]: item,
      ...(index ? { [index]: i } : {})
    };
    return resolveVNode(vnodeTemplate, extendedContext);
  });
}
```

### applyVModel

```typescript
function applyVModel(
  vModel: VModelDirective, 
  context: RenderContext, 
  props: Record<string, unknown>
): Record<string, unknown> {
  const propRef = vModel.prop;
  const event = vModel.event ?? 'update:modelValue';
  const modifiers = vModel.modifiers ?? [];
  
  // 绑定值
  let value = resolveReference(propRef, context);
  
  // 应用修饰符
  if (modifiers.includes('trim') && typeof value === 'string') {
    // trim 修饰符在事件处理时应用
  }
  if (modifiers.includes('number')) {
    value = Number(value);
  }
  
  // 绑定事件
  const updateHandler = (newValue: unknown) => {
    if (modifiers.includes('trim') && typeof newValue === 'string') {
      newValue = newValue.trim();
    }
    if (modifiers.includes('number')) {
      newValue = Number(newValue);
    }
    
    // 更新 state 或 emit
    if (propRef.prefix === 'state') {
      if (stateTypes[propRef.variable] === 'ref') {
        state[propRef.variable].value = newValue;
      } else {
        state[propRef.variable] = newValue;
      }
    } else if (propRef.prefix === 'props') {
      emit(event, newValue);
    }
  };
  
  return {
    ...props,
    modelValue: value,
    [event]: updateHandler
  };
}
```

---

## CoreScope 获取

### getCoreScope

```typescript
function getCoreScope(): Record<string, unknown> {
  const registry = getPluginRegistry();
  const scopeExtensions = registry.getScopeExtensions();
  
  return {
    _auth: scopeExtensions._auth,
    _router: scopeExtensions._router,
    _storage: scopeExtensions._storage,
    _api: scopeExtensions._api,
    _ws: scopeExtensions._ws,
    _i18n: scopeExtensions._i18n,
    _pinia: scopeExtensions._pinia,
    // ...自定义扩展
  };
}
```

---

## 缓存机制

### componentCache

```typescript
const componentCache = new Map<string, Component>();

function getCachedComponent(name: string): Component | undefined {
  return componentCache.get(name);
}

function setCachedComponent(name: string, component: Component): void {
  componentCache.set(name, component);
}

function clearCache(): void {
  componentCache.clear();
}
```

**规则**:

| 规则 ID | 规则 |
|---------|------|
| **C01** | 同名 Schema 只创建一次组件 |
| **C02** | 缓存键为 `schema.name` |
| **C03** | 可通过 `clearCache()` 清除 |
| **C04** | 修改 Schema 后需清除缓存 |

---

## 规则汇总表

| ID | 领域 | 规则 |
|----|------|------|
| RT01-RT06 | Context | 各属性访问规则 |
| E01-E04 | Expression | 表达式执行规则 |
| F01-F05 | Function | 函数体执行规则 |
| C01-C04 | Cache | 缓存机制规则 |