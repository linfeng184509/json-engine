## Why

`evaluateStringExpression()` 在 `value-resolver.ts:337` 每次调用都创建新 `Function` 对象，但 `expression.ts` 已有 `functionCache` 未被复用。同时，`createStateProxyForEvaluation()` 在每次表达式求值和指令应用时都创建新 Proxy 对象（10+ 处调用点），造成不必要的内存分配和 GC 压力。这些是运行时渲染路径上的主要性能瓶颈。

## What Changes

- **Function 缓存复用**: 将 `evaluateStringExpression()` 改为先查 `functionCache`，命中则直接执行，避免重复 `new Function()`
- **Proxy 单例化**: 在 `RenderContext` 初始化时创建 `stateProxy` 和 `computedProxy` 一次，所有指令/表达式复用，消除每次求值创建新 Proxy 的开销
- **BREAKING**: 无。这两项优化均为内部实现优化，对外 API 和行为完全兼容

## Capabilities

### New Capabilities
- `expression-eval-caching`: 表达式求值结果缓存机制，基于转换后表达式字符串复用 `Function` 实例
- `proxy-singleton-evaluation`: 渲染周期内 Proxy 对象单例化，减少内存分配和 GC 压力

### Modified Capabilities
- *(无现有 spec 需要修改)*

## Impact

- `src/packages/vue-json/src/runtime/value-resolver.ts`: 核心修改，引入 Function 缓存和 Proxy 单例
- `src/packages/vue-json/src/runtime/directive-runtime.ts`: 移除重复 Proxy 创建，使用上下文传入的 Proxy
- `src/packages/vue-json/src/runtime/render-factory.ts`: 统一 Proxy 创建点
- `src/packages/vue-json/src/utils/expression.ts`: 复用现有 `functionCache` 到 `evaluateStringExpression`
- 预期收益：表达式求值性能 5-10x 提升，内存分配减少 30-50%
