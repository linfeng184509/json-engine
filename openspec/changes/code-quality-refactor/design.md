## Context

经过深入代码审查，发现 vue-json 和 core-engine 中存在以下问题：

1. **代码重复**: `getNestedValue` 函数在 `directive-runtime.ts` 和 `value-resolver.ts` 中完全相同
2. **Slot props bug**: `render-factory.ts` 中对已是 Ref 的值再次调用 `ref()`，产生 `Ref<Ref<X>>`
3. **循环引用无检测**: `core-engine/parseJson.ts` 的 `walkJson` 函数无循环引用保护
4. **初始表达式 state 为空**: `value-resolver.ts` 中求值初始表达式时传入空的 state 对象

## Goals / Non-Goals

**Goals:**
- 消除 14 行重复代码（getNestedValue）
- 修复 slot props 的双重包装边缘 bug
- 添加循环引用检测，防止栈溢出
- 修复初始表达式 state 上下文问题

**Non-Goals:**
- 不重构 applyVIf/applyVElseIf（有意设计，差异仅 error message）
- 不修改 SSR 相关代码（项目无 SSR 框架）
- 不重写 LRU cache（实现正确）

## Decisions

### Decision 1: 抽取 getNestedValue 到 utils

**选择**: 创建 `src/packages/vue-json/src/utils/get-nested-value.ts`

**理由**:
- 两个文件都需要相同功能
- 函数无外部依赖，纯工具函数
- 避免未来同步更新问题

**替代方案**:
- 保留重复代码：短期简单，长期维护负担
- 合并到一个文件：增加耦合

### Decision 2: Slot props isRef 检查

**选择**: 在 `render-factory.ts` 的 slot 处理逻辑中添加 `isRef` 判断

```typescript
slotState[key] = isRef(value) ? value : ref(value);
```

**理由**:
- 边缘情况：现有 schemas 都传 plain values
- 修复简单，风险低
- 不影响现有功能

### Decision 3: 循环引用检测

**选择**: 使用 `WeakSet<object>` 追踪已访问对象

```typescript
const seen = new WeakSet<object>();
function walkJson(data, ...): unknown {
  if (typeof data === 'object' && data !== null) {
    if (seen.has(data)) throw new CircularReferenceError();
    seen.add(data);
    // ... 递归处理
  }
}
```

**理由**:
- WeakSet 不阻止垃圾回收
- 比 Set 更轻量
- 只追踪对象引用，不追踪基本类型

### Decision 4: 初始表达式 state 上下文

**选择**: 延迟求值或在 state 创建后填充上下文

**理由**:
- 当前问题：创建 state 时无法引用还未创建的 state
- 解决方案：支持引用已创建的 state，或延迟求值
- 影响范围有限：现有 schemas 无此用法

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| getNestedValue 抽取可能影响现有功能 | 保持相同签名，充分测试 |
| 循环引用检测增加性能开销 | 仅对对象类型检查，缓存命中率高 |

## Open Questions

- 初始表达式 state 引用的实际使用场景是否足够普遍？
- 是否需要向后兼容不支持循环引用检测的环境？
