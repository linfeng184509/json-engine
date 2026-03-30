## Context

vue-json 框架已经支持通过 JSON Schema 定义 Vue 组件，包括 props、state、computed、methods、生命周期钩子和渲染模板。框架提供了声明式组件注册机制（`registerComponents`）和值解析器系统（value parsers）。

当前限制：
- 无法在 JSON Schema 中直接定义 ECharts 图表
- 缺少对复杂图表配置的响应式支持
- 没有图表组件的生命周期管理（初始化、更新、销毁）

技术约束：
- ECharts 5.x 使用命名导出 `import * as echarts from 'echarts'`
- 图表实例需要手动管理内存（dispose）
- 容器大小变化需要手动调用 resize()

## Goals / Non-Goals

**Goals:**
- 支持在 JSON Schema 的 render 中使用 `type: 'ECharts'` 声明图表
- 支持通过 `echarts-option` 类型定义图表配置
- 支持响应式数据更新（watch state 变化自动更新图表）
- 支持容器大小自适应（autoResize）
- 支持主题配置和加载状态
- 提供类型安全的 TypeScript 定义
- 零配置：安装后自动可用

**Non-Goals:**
- 不提供高级图表交互（如下钻、联动）- 通过原生 ECharts API 实现
- 不支持 ECharts 4.x（仅支持 5.x）
- 不提供图表配置生成器（用户自行编写 option）
- 不封装具体的图表类型（bar、line 等），直接使用 ECharts option

## Decisions

### 1. 组件封装方式

**Decision**: 创建独立的 `EChartsComponent` Vue 组件，使用 `markRaw` 包装 echarts 实例

**Rationale**: 
- Vue 组件生命周期与 ECharts 生命周期对齐
- 可以使用 Vue 3 的 Composition API（setup script）
- 便于响应式数据处理和自动销毁

**Alternatives considered**:
- 使用自定义指令：不够灵活，难以管理复杂状态
- 使用渲染函数：缺少组件的生命周期优势

### 2. 响应式更新策略

**Decision**: 使用 `watch` 深度监听 option 变化，调用 `chart.setOption(option, true)`

**Rationale**:
- ECharts 的 `setOption` 支持合并模式（notMerge=false）
- 深度监听确保嵌套配置变化也能触发更新
- 使用防抖（debounce）避免频繁更新

**Alternatives considered**:
- 浅层监听 + 手动触发：用户负担重
- 使用 computed：无法处理异步数据

### 3. autoResize 实现

**Decision**: 使用 `ResizeObserver` API 监听容器大小变化

**Rationale**:
- 性能优于 window.resize 监听
- 只监听特定容器，不影响其他元素
- 现代浏览器原生支持

**Alternatives considered**:
- `window.addEventListener('resize')`: 性能差，需要节流
- 轮询检测：浪费资源

### 4. 解析器注册

**Decision**: 创建 `EChartsOptionParser`，注册到 vue-parser-config

**Rationale**:
- 遵循现有的值解析器模式
- 支持表达式引用（如 `{{ref_state_xxx}}`）
- 保持与其他解析器的一致性

### 5. 错误处理

**Decision**: 
- ECharts 未安装时输出 warning，不阻断应用
- 图表渲染失败时显示错误信息
- 提供 fallback 组件

**Rationale**:
- 优雅降级，避免整个应用崩溃
- 便于调试和问题定位

## Risks / Trade-offs

**[Performance] 深度监听大配置对象可能导致性能问题** → Mitigation: 使用防抖（300ms），避免频繁更新

**[Memory] ResizeObserver 未正确清理导致内存泄漏** → Mitigation: 在 onUnmounted 中调用 disconnect()

**[Compatibility] ResizeObserver 在旧浏览器不支持** → Mitigation: 提供 polyfill 或降级方案（仅在支持的环境启用）

**[Breaking Change] 需要用户安装 echarts 包** → Mitigation: 在 package.json 中标记为 peerDependency，提供安装提示

**[Type Safety] ECharts option 类型定义复杂** → Mitigation: 使用 `echarts` 包自带的类型，不重复定义
