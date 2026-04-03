## Why

深度分析发现 core-engine 和 vue-json 存在 11 个已验证的问题，包括性能瓶颈（Fragment 全量重渲染）、功能缺失（Cache 未接入、v-else/v-else-if 未实现）、代码质量问题（类型冲突、重复代码、console.log 泛滥）和安全性问题（require() 浏览器代码）。这些问题影响应用性能和可维护性，需要系统性修复。

## What Changes

- **修复 Fragment key 全量重渲染**：移除 version-based key 机制，改用 Vue 响应式依赖追踪
- **接入 Cache 选项到 parseJson**：将 ParserOptions.cache 集成到 walkJson 流程
- **修复 Cache 为真 LRU**：将 FIFO 改为 LRU 淘汰策略
- **清理生产环境 console.log**：替换为可配置的结构化日志系统
- **解决 VueJsonSchema 类型冲突**：统一 types/schema.ts 和 types/app.ts 中的同名类型
- **提取 validateFunctionValue 为共享工具**：消除 5 处重复代码
- **实现 v-else/v-else-if 运行时支持**：补充 directive-runtime 缺失功能
- **修复 $ref 无点号时静默失败**：添加警告或错误提示
- **补充 schema-validator 测试**：增加测试覆盖
- **修复 require() 浏览器兼容**：替换为动态导入或条件导出
- **统一错误处理模式**：统一 parseJson 中的错误处理路径

## Capabilities

### New Capabilities
- `cache-integration`: core-engine 缓存系统集成到解析流程
- `lru-cache`: 真正的 LRU 缓存淘汰策略
- `structured-logging`: 结构化日志系统替代 console.log
- `directive-else-if`: v-else/v-else-if 指令运行时支持
- `error-unification`: 统一错误处理模式

### Modified Capabilities
- `core-parsing`: 修复 $ref 静默失败问题
- `type-system`: 解决 VueJsonSchema 类型冲突
- `code-organization`: 消除重复代码和浏览器兼容问题

## Impact

- **core-engine**: cache.ts, parseJson.ts, types.ts, config-factory.ts, schema-validator.ts
- **vue-json**: component-creator.ts, types/schema.ts, types/app.ts, directive-runtime.ts, render-factory.ts, value-resolver.ts, PageLoader.ts, schema-loader.ts, lifecycle-factory.ts, type-generator.ts
- **性能**: 显著改善重渲染性能，减少不必要的 DOM 操作
- **API**: 无破坏性变更，仅内部实现优化
