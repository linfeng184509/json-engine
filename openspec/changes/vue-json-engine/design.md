# vue-json-engine Design

## Context

### Background

`vue-json-engine` 是 `@json-engine` monorepo 的核心子项目之一，定位为纯 JSON 引擎框架。目标是将 JSON Schema 在运行时转换为可执行的 Vue 3 组件，无需预编译步骤。

### Current State

- `@json-engine/core-engine` 已实现基础 JSON 解析能力（parseJson, KeyParser, ValueParser）
- `@json-engine/vue-json` 目录已创建，包含基础 composables 结构
- 需要实现完整的 JSON-to-Vue 运行时转换能力

### Constraints

- 仅支持 Vue 3（Composition API）
- 目标环境：现代浏览器（ES2022+）
- 必须依赖 `@json-engine/core-engine`
- 运行时转换，不生成中间代码

### Stakeholders

- 前端开发者：使用 JSON 描述动态组件
- 低代码平台：通过 JSON 配置生成 UI
- 表单构建器：动态表单渲染

## Goals / Non-Goals

**Goals:**

- 实现完整的 JSON Schema 解析器，支持 Vue SFC 的 JSON 表示
- 实现运行时渲染引擎，使用 `h()` 和 `defineComponent` 生成组件
- 支持完整的 Vue 3 响应式系统（ref, reactive, computed, watch, provide/inject）
- 支持所有常用模板指令（v-if, v-for, v-show, v-model, v-bind, v-on, v-slot）
- 支持所有 Vue 3 生命周期钩子
- 支持组件注册（本地组件和异步组件）
- 支持运行时样式注入（包括 scoped CSS）
- 生成 TypeScript 类型定义

**Non-Goals:**

- 不支持 Vue 2
- 不支持编译时优化（如 SSR）
- 不支持 JSX 语法
- 不支持自定义指令注册
- 不支持 Transition/TransitionGroup 内置组件

## Decisions

### 1. JSON Schema 结构设计

**Decision**: 采用功能模块组织方式，而非映射 SFC 结构

**Rationale**:
- 功能模块组织更清晰，便于解析器独立处理各模块
- 避免与 SFC 结构强耦合，便于后续扩展
- 与 core-engine 的 parseJson 流程更契合

**Structure**:
```typescript
interface VueJsonSchema {
  name: string;
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
  render: RenderDefinition;
  styles?: StylesDefinition;
}
```

**Alternatives Considered**:
- SFC 映射结构（template, script, style）：与 Vue 编译器耦合度高
- AST 风格：过于底层，开发者编写困难

### 2. core-engine 集成策略

**Decision**: 预处理 + 模块解析

**Rationale**:
- 先使用 `parseJson` 预处理整个 JSON Schema，处理嵌套引用
- 各模块 Parser 内部调用对应的 ValueParser 解析值
- KeyParser 用于组件名、状态键名、事件名等映射

**Flow**:
```
JSON Schema → parseJson (预处理)
    ↓
SchemaParser (验证结构)
    ↓
各模块 Parser (并行解析)
    ├── PropsParser
    ├── StateParser
    ├── ComputedParser
    ├── ...
    └── RenderParser
    ↓
ComponentFactory (生成组件)
```

**Alternatives Considered**:
- 独立解析：不依赖 core-engine，重新实现解析逻辑 → 代码重复
- 部分使用：仅使用部分解析能力 → 限制灵活性

### 3. 表达式求值策略

**Decision**: 使用 `new Function` 动态执行

**Rationale**:
- JSON 中的表达式是字符串形式的 JavaScript 代码
- `new Function` 比 `eval` 更安全，作用域可控
- 通过注入上下文变量（props, state, computed, methods）实现沙箱

**Implementation**:
```typescript
function evaluateExpression(expr: string, context: RenderContext): unknown {
  const fn = new Function(
    'props', 'state', 'computed', 'methods', 'emit',
    `return ${expr};`
  );
  return fn(context.props, context.state, context.computed, context.methods, context.emit);
}
```

**Security Consideration**:
- 仅在可信 JSON 来源使用
- 未来可添加表达式白名单机制

### 4. 组件生成策略

**Decision**: 使用 `defineComponent` + 返回渲染函数

**Rationale**:
- 完全利用 Vue 3 响应式系统
- 渲染函数比模板编译更直接
- 支持动态更新 JSON Schema

**Implementation**:
```typescript
function createComponent(schema: VueJsonSchema): Component {
  return defineComponent({
    name: schema.name,
    props: parseProps(schema.props),
    emits: parseEmits(schema.emits),
    setup(props, { emit, slots, attrs }) {
      const state = createState(schema.state);
      const computed = createComputed(schema.computed, { props, state, emit });
      const methods = createMethods(schema.methods, { props, state, computed, emit });
      
      setupWatchers(schema.watch, { props, state, computed, methods });
      setupLifecycle(schema.lifecycle, { props, state, computed, methods, emit });
      
      return () => renderVNode(schema.render, { props, state, computed, methods, emit, slots, attrs });
    }
  });
}
```

### 5. 指令运行时实现

**Decision**: 渲染函数内条件分支处理

**Rationale**:
- 避免 Vue 模板编译器的复杂性
- 直接在 JavaScript 层面处理逻辑
- 支持动态指令参数

**v-if Example**:
```typescript
function applyVIf(condition: string, context: RenderContext, branches: VNodeBranch[]): VNode | null {
  for (const branch of branches) {
    if (!branch.condition || evaluateExpression(branch.condition, context)) {
      return renderVNode(branch.node, context);
    }
  }
  return null;
}
```

**v-for Example**:
```typescript
function applyVFor(source: string, alias: string, context: RenderContext, renderItem: Function): VNode[] {
  const items = evaluateExpression(source, context);
  return items.map((item, index) => {
    const extendedContext = { ...context, [alias]: item, [`${alias}Index`]: index };
    return renderItem(item, index, extendedContext);
  });
}
```

### 6. 样式注入策略

**Decision**: 运行时注入 `<style>` 标签，scoped 使用唯一属性选择器

**Rationale**:
- 与 Vue SFC scoped CSS 兼容
- 支持动态样式更新
- 不需要 CSS 预处理器

**Implementation**:
```typescript
function injectStyles(componentId: string, css: string, scoped: boolean): void {
  let processedCss = css;
  if (scoped) {
    processedCss = css.replace(/([^{]+)\{/g, `$1[data-v-${componentId}] {`);
  }
  
  const style = document.createElement('style');
  style.id = `vue-json-style-${componentId}`;
  style.textContent = processedCss;
  document.head.appendChild(style);
}
```

### 7. TypeScript 类型生成

**Decision**: 从 JSON Schema 生成 .d.ts 文件

**Rationale**:
- 提供类型安全
- 支持 IDE 自动补全
- 可选功能，不影响运行时

**Implementation**:
```typescript
function generateTypes(schema: VueJsonSchema): string {
  const propsType = generatePropsType(schema.props);
  const stateType = generateStateType(schema.state);
  const computedType = generateComputedType(schema.computed);
  
  return `
declare const ${schema.name}: {
  props: ${propsType};
  state: ${stateType};
  computed: ${computedType};
};
  `;
}
```

## Risks / Trade-offs

### Risk 1: 性能开销

**Risk**: 运行时解析和表达式求值带来性能开销

**Mitigation**:
- 缓存已解析的组件
- 对表达式求值结果进行 memoization
- 提供 `preloadComponent` API 预加载常用组件

### Risk 2: 安全风险

**Risk**: `new Function` 执行用户输入的表达式存在安全风险

**Mitigation**:
- 文档明确说明仅用于可信 JSON 来源
- 提供 `sandbox` 选项限制可访问的上下文
- 未来可添加表达式验证器

### Risk 3: 调试困难

**Risk**: 运行时生成的组件堆栈信息难以定位

**Mitigation**:
- 在开发模式下添加 source map 支持
- 提供 `debug` 模式输出中间状态
- 错误消息包含 JSON Schema 位置信息

### Risk 4: 复杂指令支持

**Risk**: 部分复杂指令（如 v-model 双向绑定）实现复杂

**Mitigation**:
- v-model 拆分为 v-bind + v-on 组合实现
- 限制支持的指令范围，复杂场景使用自定义组件

### Trade-off 1: 灵活性 vs 性能

- 选择运行时转换，牺牲编译时优化换取灵活性
- 适用场景：动态配置、低代码平台、表单构建器
- 不适用场景：高性能静态页面

### Trade-off 2: 完整性 vs 复杂度

- 支持完整 Vue 3 能力增加实现复杂度
- 部分高级特性（自定义指令、Transition）暂不支持
- 后续可根据需求逐步添加

## Migration Plan

N/A（全新项目，无需迁移）

## Open Questions

1. **异步组件错误边界**：异步组件加载失败时的 fallback 策略？建议使用 Vue 3 的 `onErrorCaptured` 钩子处理

2. **SSR 支持**：是否需要在未来支持服务端渲染？建议作为独立 feature 规划

3. **Vue DevTools 集成**：运行时生成的组件如何与 DevTools 配合？需要调研 Vue DevTools API

4. **大型 JSON Schema 优化**：复杂组件的 JSON Schema 可能很大，是否需要分片加载？建议按需实现