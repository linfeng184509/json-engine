## Context

**现状分析：**

core-engine 当前提供 JSON 解析能力，但存在以下问题：

1. **语义耦合**：类型定义和正则表达式使用 `props`、`state`、`scope` 等命名，直接暗示 Vue 语义
2. **全局状态**：`globalKeyParserRegistry` 需要手动注册/清理，容易导致副作用
3. **固定格式**：引用前缀 `ref_props_`、`ref_state_` 硬编码，不支持自定义
4. **类型标记缺失**：parseJson 输出不包含 `_type` 字段，运行时需自行判断

**约束：**
- 必须保持向后兼容或提供清晰的迁移路径
- vue-json 依赖 core-engine，重构不能破坏现有功能
- 性能不能明显下降

## Goals / Non-Goals

**Goals：**
- core-engine 成为完全框架无关的解析引擎
- 支持任意框架的引用格式配置（如 React 的 `this.props.xxx`）
- 插件化架构，允许注册自定义 ValueParser
- 消除全局状态，所有配置通过参数传递
- 输出统一包含 `_type` 标记

**Non-Goals：**
- 不实现具体的 React/Svelte 适配层（仅预留接口）
- 不保留旧格式兼容（BREAKING CHANGE）
- 不在 core-engine 中包含任何框架特定逻辑

## Decisions

### Decision 1: 抽象类型系统

**选择：** 定义抽象类型接口，移除框架特定命名

```typescript
// 抽象引用类型
interface ReferenceParseData {
  prefix: string;    // 'props', 'state', 'context' 等
  variable: string;
  path?: string;     // 支持嵌套路径
}

// 抽象 Scope 类型
interface ScopeParseData {
  scope: string;     // 可自定义，不限于 'core'/'goal'
  variable: string;
}

// 抽象 Expression 类型
interface ExpressionParseData {
  expression: string | ReferenceParseData | ScopeParseData;
}

// 统一输出标记
interface TypedParseResult<T extends string, D> {
  _type: T;
  data: D;
}
```

**理由：** 类型与框架无关，适配层自行定义 prefix 映射

### Decision 2: 插件化 Parser 配置

**选择：** 移除全局 registry，改用 ParserConfig 对象

```typescript
interface ParserConfig {
  referencePrefixes?: string[];  // ['props', 'state', 'computed']
  scopeNames?: string[];         // ['core', 'goal', 'global']
  valueParsers?: Record<string, ValueParserFn>;
  keyParsers?: Record<string, KeyParserFn>;
  onParsed?: ParseCallback;
}

function parseJson(input: unknown, config?: ParserConfig): unknown;
```

**理由：** 消除全局状态副作用，支持实例化配置

### Decision 3: 动态正则表达式工厂

**选择：** 提供正则工厂函数，支持自定义前缀

```typescript
function createReferenceRegex(prefixes: string[]): RegExp {
  const pattern = prefixes.join('|');
  return new RegExp(`^\\{\\{ref_(${pattern})_(.+)\\}\\}$`);
}

function createScopeRegex(scopeNames: string[]): RegExp {
  const pattern = scopeNames.join('|');
  return new RegExp(`^\\{\\{\\$_\\[(${pattern})\\]_(.+)\\}\\}$`);
}
```

**理由：** 一个函数支持所有引用格式配置

### Decision 4: Vue 适配层配置

**选择：** vue-json 创建 VueParserConfig，复用 core-engine

```typescript
// vue-json/src/config/vue-parser-config.ts
import { createParserConfig } from '@json-engine/core-engine';

export const vueParserConfig = createParserConfig({
  referencePrefixes: ['props', 'state', 'computed'],
  scopeNames: ['core', 'goal'],
  keyParsers: {
    'component-name': (key) => toPascalCase(key),
  },
});
```

**理由：** 框架适配层定义自己的配置，core-engine 完全通用

### Decision 5: 多框架适配接口

**选择：** 定义标准适配接口

```typescript
interface FrameworkAdapter {
  name: string;
  config: ParserConfig;
  runtime: {
    createState: (def: StateDefinition, ctx: SetupContext) => Record<string, unknown>;
    createComputed: (def: ComputedDefinition, ctx: RenderContext) => Record<string, unknown>;
    // ...
  };
  types: {
    Schema: unknown;
    VNode: unknown;
  };
}
```

**理由：** 未来可扩展 React、Svelte 等适配层

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| BREAKING CHANGE 破坏现有 vue-json | 提供详细迁移文档和 codemod 工具 |
| 正则表达式性能下降 | 正则工厂结果缓存，避免重复创建 |
| 配置复杂度增加 | 提供预设配置（如 vueParserConfig）简化使用 |
| 多框架适配接口设计不当 | 先实现 Vue 适配，验证接口后再扩展 |

## Open Questions

1. **迁移策略**：是否提供自动化 codemod 工具？
2. **版本策略**：core-engine 2.0 vs 1.x 兼容层？
3. **性能基准**：需建立性能测试，确保不比当前慢
