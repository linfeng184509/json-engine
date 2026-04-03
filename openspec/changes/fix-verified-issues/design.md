## Context

core-engine 和 vue-json 存在 11 个已验证的问题，涉及性能、功能缺失、代码质量和浏览器兼容性。当前状态：
- `component-creator.ts` 使用 version-based Fragment key 导致每次 state 变化都全量重建 DOM
- `parseJson.ts` 完全不使用 `ParserOptions.cache` 配置
- `ParserCache` 是 FIFO 而非 LRU，且 `evictExpired()` 每次 `set()` 都 O(n) 全量扫描
- 31 处 `console.log` 散布在生产代码中
- `VueJsonSchema` 类型在 schema.ts 和 app.ts 中定义冲突
- `validateFunctionValue` 在 5 个 parser 文件中重复
- `directive-runtime.ts` 缺少 v-else/v-else-if 运行时处理
- `parseJson.ts` 对无效 `$ref` 静默失败
- `schema-validator.ts` 零测试覆盖
- `type-generator.ts` 使用 `require('fs')` 无法在浏览器运行
- `parseJson.ts` 错误处理路径不一致（throw vs return）

## Goals / Non-Goals

**Goals:**
- 消除 Fragment 全量重渲染，改用 Vue 响应式自动追踪
- 将 cache 集成到 parseJson 的 walkJson 流程
- 实现真正的 LRU 缓存淘汰策略
- 用结构化日志系统替换所有 console.log
- 统一 VueJsonSchema 类型定义
- 提取 validateFunctionValue 为共享工具函数
- 实现 v-else/v-else-if 指令运行时
- 修复 $ref 静默失败，添加警告
- 补充 schema-validator 测试
- 修复浏览器兼容性问题
- 统一错误处理模式

**Non-Goals:**
- 不改变 new Function() 设计（这是架构决策）
- 不引入外部日志库（使用轻量级内置方案）
- 不改变现有 DSL 语法格式
- 不改变组件创建和渲染的整体架构

## Decisions

### 1. Fragment 重渲染方案
**决策**: 移除 version ref 和 watcher 循环，直接返回 vnode，依赖 Vue 的响应式系统自动追踪依赖。
**理由**: Vue 3 的 `h()` 函数会自动追踪 render 函数中访问的 ref。当 ref 变化时，Vue 会自动重新执行 render 函数并 diff VNode。手动 version key 反而破坏了 Vue 的 diff 算法。
**替代方案**: 使用 `computed()` 包装 vnode — 过度设计，Vue 已经自动处理。

### 2. Cache 集成方案
**决策**: 在 `walkJson` 中为每个节点路径计算 cache key，先查缓存再解析。
**理由**: 最小侵入式改动，保持现有 API 不变。cache key 使用 `path + JSON.stringify(value)` 确保唯一性。
**替代方案**: 在 `parseJson` 入口缓存整个结果 — 粒度太粗，无法复用子树。

### 3. LRU 实现方案
**决策**: 使用 Map 的插入顺序特性，`get()` 时删除并重新插入以更新访问顺序。
**理由**: 零依赖，Map 已保证插入顺序，只需在 get 时 move-to-end 即可实现 LRU。
**替代方案**: 引入 lru-cache 包 — 增加依赖，不必要。

### 4. 日志系统方案
**决策**: 创建轻量级 `Logger` 类，支持级别过滤（debug/info/warn/error），默认 production 只输出 warn+error。通过 `ParserConfig.debug` 控制。
**理由**: 零依赖，与现有 debug 配置集成。
**替代方案**: 使用 winston/pino — 过重，不适用于库代码。

### 5. VueJsonSchema 类型统一
**决策**: 保留 `types/schema.ts` 中的完整定义，将 `types/app.ts` 中的重命名为 `VueJsonSchemaType` 并标记 deprecated，添加类型别名指向 schema.ts 版本。
**理由**: 向后兼容，现有使用 `VueJsonSchemaType` 的代码不受影响。

### 6. validateFunctionValue 提取
**决策**: 提取到 `src/utils/validate-function.ts`，所有 parser 文件导入使用。
**理由**: 5 份代码几乎完全相同，提取后减少维护成本。

### 7. v-else/v-else-if 实现
**决策**: 在 `render-factory.ts` 中添加 v-else-if 条件链处理和 v-else 默认分支处理，与 v-if 共享 `applyVIf` 逻辑。
**理由**: 复用现有 v-if 评估逻辑，保持一致性。

### 8. $ref 静默失败处理
**决策**: 当 `$ref` 不包含点号时，调用 `config.onError` 并返回原始值，同时在 debug 模式下输出警告。
**理由**: 不破坏现有行为（仍返回原始值），但提供可观测性。

### 9. 错误处理统一
**决策**: 在 `parseValueByType` 中创建内部 `handleParseError` 辅助函数，统一 6 处错误处理逻辑。
**理由**: DRY 原则，减少维护成本。

### 10. require() 浏览器兼容
**决策**: 将 `writeTypeDefinition` 函数标记为 Node.js 专用，使用 `typeof require !== 'undefined'` 条件检查，浏览器环境抛出友好错误。
**理由**: 该函数本身就是开发工具，不应在浏览器中调用。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| 移除 version key 后，某些依赖全量重渲染的边缘场景可能失效 | Vue 响应式系统已覆盖所有 ref 依赖场景，version key 本身就是反模式 |
| Cache key 使用 JSON.stringify 可能影响性能 | 仅对对象类型值计算，原始值直接跳过；可配置关闭 |
| LRU 的 get() move-to-end 操作增加 O(1) 开销 | 相比 O(n) 全量扫描，总体性能显著提升 |
| 日志系统替换可能遗漏某些 console.log | 通过 lint 规则强制检查，CI 中拦截 |
| v-else/v-else-if 实现可能影响现有 v-if 行为 | 独立测试路径，确保 v-if 单独使用时行为不变 |
