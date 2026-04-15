## Why

vue-json 和 core-engine 经过深度代码审查后，发现多个代码质量和正确性问题。这些问题虽然大部分是边缘情况或潜伏 bug，但会影响代码可维护性和长期稳定性。

## What Changes

- 抽取 `getNestedValue` 公共函数，消除跨文件重复代码
- 修复 slot props 双重包装 bug，防止 `Ref<Ref<X>>` 产生
- 为 `walkJson` 添加循环引用检测，防止栈溢出
- 修复初始表达式 state 上下文传递问题

## Capabilities

### New Capabilities

- `code-duplication-cleanup`: 抽取重复的 `getNestedValue` 函数到 utils 目录
- `slot-props-fix`: 修复 slot props 的 `isRef` 检查，防止双重包装
- `circular-ref-detection`: 为 walkJson 添加循环引用检测
- `initial-expression-fix`: 修复初始表达式求值时 state 上下文为空的问题

### Modified Capabilities

- 无

## Impact

- `src/packages/vue-json/src/runtime/directive-runtime.ts` - 抽取 getNestedValue
- `src/packages/vue-json/src/runtime/value-resolver.ts` - 抽取 getNestedValue，修复 state 上下文
- `src/packages/vue-json/src/runtime/render-factory.ts` - 修复 slot props isRef 检查
- `src/packages/core-engine/src/parseJson.ts` - 添加循环引用检测
