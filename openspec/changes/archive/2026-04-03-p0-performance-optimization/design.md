## Context

`@json-engine/vue-json` 在运行时通过 `evaluateStringExpression()` 和 `executeFunction()` 动态执行 JavaScript 表达式。当前存在两个性能瓶颈：

1. **Function 创建无缓存**: `value-resolver.ts:337` 每次调用 `evaluateStringExpression()` 都执行 `new Function()`，而 `expression.ts:10-14` 已有 `functionCache`（LRU, maxSize=1000）但未被 `evaluateStringExpression()` 使用。

2. **Proxy 重复创建**: `createStateProxyForEvaluation()` 在 `value-resolver.ts:333-334`、`directive-runtime.ts` 的 6 个函数、`render-factory.ts` 的 3 个位置被调用，每次创建 2 个新 Proxy 对象。一个典型组件单次渲染可能创建 15+ 个 Proxy。

**约束**: 必须保持对外 API 完全兼容，不改变任何表达式语法或行为。

## Goals / Non-Goals

**Goals:**
- 消除 `evaluateStringExpression()` 中的重复 `new Function()` 调用
- 消除渲染周期内重复的 Proxy 创建
- 保持 100% API 向后兼容
- 不引入新的外部依赖

**Non-Goals:**
- 不实现虚拟滚动（属于 P3）
- 不实现跨 `parseJson()` 调用的解析缓存（属于 P1）
- 不改变表达式语法或 DSL 格式

## Decisions

### Decision 1: Function 缓存策略

**选择**: 以 `transformed` 表达式字符串为缓存 key，缓存编译后的 `Function` 实例。

**理由**:
- `transformed` 是替换 `$state` → `state` 等变量后的最终代码字符串，相同逻辑的表达式必然产生相同的 `transformed`
- 复用 `expression.ts` 中已有的 `functionCache`，避免引入新缓存实例
- 缓存 key 不含 context 变量值，因为 Function 本身是无状态的，仅代码字符串决定其行为

**替代方案**:
- 以原始 `expression` 为 key：不可行，因为 `$state.count` 和 `state.count` 语义相同但字符串不同
- 缓存执行结果而非 Function：不可行，因为相同表达式在不同 context 下结果不同

### Decision 2: Proxy 单例化策略

**选择**: 在 `RenderContext` 扩展类型中添加 `stateProxy` 和 `computedProxy` 字段，在 `setup()` 阶段创建一次，通过 context 传递到所有指令/表达式求值函数。

**理由**:
- Proxy 本身无状态，仅做 `.value` 自动解包，同一渲染周期内 state/computed 对象引用不变
- 最小化函数签名变更：仅需在内部函数间传递 context，不改变公开 API
- `RenderContext` 已是所有求值函数的统一参数，扩展自然

**替代方案**:
- 全局单例 Proxy：不可行，不同组件实例的 state 不同
- 惰性创建 Proxy：增加复杂度，收益不如一次性创建

### Decision 3: 缓存失效策略

**选择**: 不主动失效。`functionCache` 使用 LRU  eviction（maxSize=1000），自然淘汰不常用条目。

**理由**:
- Function 实例仅依赖代码字符串，不依赖运行时状态，永不过期是安全的
- LRU 已足够控制内存占用

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `functionCache` 中缓存的 Function 引用外部变量 | Function 通过参数接收所有上下文变量（props, state, computed 等），不捕获闭包变量，安全 |
| Proxy 单例在 state 对象被替换后失效 | Vue 的 ref/reactive 对象引用在组件生命周期内不变，仅 `.value` 变化，Proxy 始终有效 |
| 缓存占用内存增长 | LRU maxSize=1000 限制，每个 Function 约 1-2KB，总内存 < 2MB |
| 多线程/SSR 环境下的缓存竞争 | Vue 3 单线程执行，无并发竞争；SSR 场景下每个请求独立 context，Function 缓存可共享 |
