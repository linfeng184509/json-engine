# @json-engine/core-engine

> JSON DSL 解析引擎 — 将声明式 JSON Schema 转换为带类型标记的 AST 节点树

## 概述

`@json-engine/core-engine` 是一个纯 JSON 驱动的 DSL（领域特定语言）解析引擎。它接受包含特殊关键字的 JSON 输入，通过递归遍历和正则匹配，将其转换为带有 `_type` 标记的 AST（抽象语法树）节点树。该引擎是整个 `@json-engine` 生态系统的核心，为 `vue-json` 渲染器、插件系统和应用运行时提供底层解析能力。

**核心特性：**
- 无全局状态，完全配置驱动，确定性可复现
- 四种 DSL 关键字：`$ref`、`$expr`、`$fn`、`$scope`
- 可扩展的值解析器注册表和键名转换器
- 完整的钩子系统：`beforeParse`、`afterParse`、`transformResult`、`onParsed`、`onError`
- 内置调试追踪（`DebugTracer`）和 LRU/TTL 缓存（`ParserCache`）
- 轻量级 JSON Schema 验证器

## 安装

```bash
npm install @json-engine/core-engine
```

## 快速开始

```typescript
import { parseJson } from '@json-engine/core-engine';

const schema = {
  type: 'ALayout',
  props: {
    style: { $expr: "'min-height: 100vh'" },
  },
  children: [
    {
      type: 'ALayoutSider',
      props: {
        collapsed: { $ref: 'state.collapsed' },
        theme: 'light',
      },
      directives: {
        vOn: {
          collapse: { $fn: 'state.collapsed = args[0];' },
        },
      },
    },
  ],
};

const ast = parseJson(schema);
// 返回 AST 树，其中 $ref/$expr/$fn 等被转换为带 _type 标记的节点
```

## DSL 语法

引擎通过 `normalizeValue` 识别以下四种关键字，将其转换为内部 AST 节点。普通 JSON 值（字符串、数字、布尔值、`null`、数组、不含关键字的普通对象）原样保留。

### 1. `$ref` — 数据引用

引用 `props`、`state`、`computed` 中的数据，支持点分路径访问。

```json
// 基础引用
{ "$ref": "state.count" }
{ "$ref": "props.userId" }
{ "$ref": "computed.totalPrice" }

// 嵌套路径（variable 为第一个段，path 为剩余段）
{ "$ref": "state.user.profile.email" }
```

**解析后 AST 节点：**

```typescript
{ _type: 'reference', prefix: 'state', variable: 'count' }
{ _type: 'reference', prefix: 'state', variable: 'user', path: 'profile.email' }
```

默认支持的引用前缀为 `props`、`state`、`computed`，可通过 `referencePrefixes` 配置项扩展。

`$ref` 的值必须包含至少一个点（`.`），点前为前缀，点后为变量名（可含更多点作为 path）。若不含点则原样返回，不做转换。

### 2. `$expr` — 表达式

包裹一段可求值的表达式字符串。

```json
{ "$expr": "state.count > 0" }
{ "$expr": "'Hello, ' + props.name" }
{ "$expr": "state.count > 5 ? 'many' : 'few'" }
```

**解析后 AST 节点：**

```typescript
{ _type: 'expression', expression: 'state.count > 0' }
```

表达式内容会经过 `parseNestedReference` 检测：若表达式本身恰好匹配引用或作用域模式，则 `expression` 字段会被替换为对应的 AST 节点而非字符串。

### 3. `$fn` — 函数

定义可执行的函数体，支持三种写法。

```json
// 写法一：字符串形式（无参数）
{ "$fn": "methods.handleClick()" }

// 写法二：对象形式，参数为数组（参数值初始化为 null）
{
  "$fn": {
    "params": ["e", "data"],
    "body": "console.log(e, data)"
  }
}

// 写法三：字符串形式，通过同级 params 对象传默认值
{
  "$fn": "handleClick",
  "params": { "eventType": "click" }
}
```

**解析后 AST 节点：**

```typescript
{ _type: 'function', params: {}, body: 'methods.handleClick()' }
{ _type: 'function', params: { e: null, data: null }, body: 'console.log(e, data)' }
{ _type: 'function', params: { eventType: 'click' }, body: 'handleClick' }
```

### 4. `$scope` — 服务注入

注入外部服务或依赖，格式为 `scopeName.serviceName`。

```json
{ "$scope": "core.apiClient" }
{ "$scope": "goal.userService" }
```

**解析后 AST 节点：**

```typescript
{ _type: 'scope', scope: 'core', variable: 'apiClient' }
```

默认支持的作用域名为 `core` 和 `goal`，可通过 `scopeNames` 配置项扩展。

`$scope` 的值必须包含点（`.`），点前为 scope 名，点后为变量名。若不含点则不做转换。

### AST 节点类型总览

所有解析后的 DSL 节点使用 `_type` 字段作为判别标记（discriminant）：

```typescript
// 引用节点
{ _type: 'reference', prefix: string, variable: string, path?: string }

// 作用域注入节点
{ _type: 'scope', scope: string, variable: string }

// 表达式节点
{ _type: 'expression', expression: string | AbstractReferenceParseData | AbstractScopeParseData }

// 函数节点
{ _type: 'function', params: Record<string, unknown>, body: string }
```

普通 JSON 值（字符串、数字、布尔值、`null`、数组、普通对象）不经任何转换，原样保留在 AST 树中。

## 解析流程

```
JSON 输入
    │
    ▼
┌──────────────┐
│ normalizeValue│  $ref/$expr/$fn/$scope → { type, body/prefix/variable }
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ parseValueByType │  将 { type, ... } 解析为 { _type, ... } AST 节点
└──────┬───────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│               walkJson() 递归遍历                │
│                                                 │
│  对每个对象键值对 / 数组元素：                     │
│  1. beforeParse 钩子（可拦截/修改值）             │
│  2. normalizeValue() 标准化 DSL 关键字            │
│  3. parseValueByType() 解析为 AST 节点            │
│  4. walkJson() 递归处理子节点                     │
│  5. transformResult 钩子（后处理结果）             │
│  6. afterParse 钩子（观察原始值与解析结果）         │
│  7. onParsed 回调（通知每个节点的解析完成）         │
└──────┬──────────────────────────────────────────┘
       │
       ▼
  AST 节点树（DSL 节点带 _type 标记，普通值原样保留）
```

## API 参考

### `parseJson(input, options?)`

核心解析入口。将 JSON/DSL 输入递归转换为 AST 节点树。

```typescript
function parseJson(
  input: unknown,
  options?: ParserOptions
): unknown
```

**参数：**
- `input` — 任意 JSON 值。含 `$ref`/`$expr`/`$fn`/`$scope` 的对象会被转换，普通值原样保留
- `options` — 可选的解析配置（见下方 `ParserOptions`）

**返回：** 解析后的 AST 树

### `normalizeValue(value)`

将 DSL 简写格式转换为内部 `{ type, ... }` 格式。这是 `parseJson` 内部调用的第一步，也可单独使用。

```typescript
normalizeValue({ $ref: 'state.user.name' })
// → { type: 'reference', prefix: 'state', variable: 'user', path: 'name' }

normalizeValue({ $expr: 'a + b' })
// → { type: 'expression', body: '{{a + b}}' }

normalizeValue({ $fn: 'methods.click' })
// → { type: 'function', params: '{{{}}}', body: '{{methods.click}}' }

normalizeValue({ $scope: 'core.api' })
// → { type: 'scope', body: '{{$_[core]_api}}' }

normalizeValue('hello')     // → 'hello'（原样保留）
normalizeValue(42)          // → 42（原样保留）
normalizeValue({ a: 1 })    // → { a: 1 }（原样保留）
```

### `createParserConfig(options?)`

从可选参数构建完整的 `ParserConfig` 对象，自动生成正则表达式。

```typescript
import { createParserConfig, parseJson } from '@json-engine/core-engine';

const config = createParserConfig({
  referencePrefixes: ['props', 'state', 'computed', 'context'],
  scopeNames: ['core', 'goal', 'plugin'],
  keyParsers: {
    vOn: (key) => `on${key.charAt(0).toUpperCase() + key.slice(1)}`,
  },
});

const ast = parseJson(schema, config);
```

### `validateSchema(input, schema)`

轻量级 JSON Schema 验证器（非完整 JSON Schema 规范，为自定义子集）。

```typescript
import { validateSchema, createJsonSchema } from '@json-engine/core-engine';

const schema = createJsonSchema({
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    age: { type: 'number', minimum: 0, maximum: 150 },
    role: { type: 'string', enum: ['admin', 'user', 'guest'] },
  },
  required: ['name'],
  additionalProperties: false,
});

const result = validateSchema({ name: 'Alice', age: 30 }, schema);
// { valid: true, errors: [] }

const badResult = validateSchema({ age: -1 }, schema);
// { valid: false, errors: [
//   { path: 'name', message: "Required property 'name' is missing", ... },
//   { path: 'age', message: "Value -1 is less than minimum 0", ... },
// ]}
```

### `createSchemaValidator(schema)`

柯里化版本的 Schema 验证器。

```typescript
const validate = createSchemaValidator(schema);
validate({ name: 'Bob' });  // ValidationResult
```

### `ParserCache`

LRU/TTL 缓存系统，可缓存解析结果。

```typescript
import { createParserCache } from '@json-engine/core-engine';

const cache = createParserCache({
  enabled: true,
  maxSize: 500,    // 最大条目数
  ttl: 60000,      // 过期时间（毫秒），0 表示永不过期
});

const result = cache.getOrCompute('schema:user-form', () => parseJson(schema));
```

### `DebugTracer`

调试追踪系统，记录每次解析的路径、输入、输出和耗时。

```typescript
import { createDebugTracer } from '@json-engine/core-engine';

const tracer = createDebugTracer({
  enabled: true,
  logLevel: 'debug',  // 'error' | 'warn' | 'info' | 'debug'
  onTrace: (trace) => {
    console.log(`${trace.path}: ${trace.duration.toFixed(2)}ms`);
  },
});

// 通过 parseJson 的 debug 选项启用
parseJson(schema, { debug: { enabled: true, logLevel: 'debug' } });
```

## 配置选项

### `ParserOptions`

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `referencePrefixes` | `string[]` | `['props', 'state', 'computed']` | 可识别的 `$ref` 前缀 |
| `scopeNames` | `string[]` | `['core', 'goal']` | 可识别的 `$scope` 作用域名 |
| `valueParsers` | `ValueParserRegistry` | `{}` | 自定义值类型解析器 |
| `keyParsers` | `KeyParserRegistry` | `{}` | 自定义键名转换器 |
| `onParsed` | `ParseCallback` | — | 每个节点解析完成后的回调 |
| `onError` | `ErrorCallback` | — | 解析错误时的回调 |
| `hooks` | `ParserHooks` | — | 生命周期钩子 |
| `cache` | `CacheOptions` | — | 缓存配置 |
| `debug` | `DebugOptions` | — | 调试配置 |

### `ParserHooks`

| 钩子 | 签名 | 说明 |
|------|------|------|
| `beforeParse` | `(path: string, value: unknown) => unknown \| void` | 解析前调用，返回值非 `undefined` 时替换原值 |
| `afterParse` | `(path: string, original: unknown, parsed: unknown) => void` | 解析后调用，可观察原始值与解析结果 |
| `transformResult` | `(path: string, result: unknown) => unknown` | 后处理解析结果，返回值替换最终结果 |
| `onError` | `(path: string, error: ParseError) => unknown \| void` | 解析错误时调用 |

### 自定义值解析器

通过 `valueParsers` 注册自定义类型解析器：

```typescript
const config = createParserConfig({
  valueParsers: {
    style: (body: string) => parseCustomStyle(body),
  },
});
```

### 自定义键名转换器

通过 `keyParsers` 注册键名转换器，在解析时修改对象键名：

```typescript
const config = createParserConfig({
  keyParsers: {
    vOn: (key: string) => `on${key.charAt(0).toUpperCase() + key.slice(1)}`,
    // vOn → onVOn
  },
});
```

## 类型定义

### 输入格式（用户编写）

| 关键字 | 用途 | 示例 |
|--------|------|------|
| `$ref` | 引用状态/属性/计算值 | `{ "$ref": "state.user.name" }` |
| `$expr` | 表达式求值 | `{ "$expr": "count + 1" }` |
| `$fn` | 函数定义 | `{ "$fn": "methods.handleClick" }` |
| `$scope` | 服务/作用域注入 | `{ "$scope": "core.apiClient" }` |

### 输出格式（AST 节点）

```typescript
// 引用节点
interface AbstractReferenceParseData {
  _type: 'reference';
  prefix: string;      // 如 'props' | 'state' | 'computed'
  variable: string;    // 变量名，如 'user'
  path?: string;       // 可选的嵌套路径，如 'profile.email'
}

// 作用域注入节点
interface AbstractScopeParseData {
  _type: 'scope';
  scope: string;       // 如 'core' | 'goal'
  variable: string;    // 服务名，如 'apiClient'
}

// 表达式节点
interface ExpressionParseData {
  _type: 'expression';
  expression: string | AbstractReferenceParseData | AbstractScopeParseData;
}

// 函数节点
interface FunctionParseData {
  _type: 'function';
  params: Record<string, unknown>;
  body: string;
}

// 字符串节点（内部使用）
interface StringParseData {
  _type: 'string';
  value: string;
}

// 对象节点（内部使用）
interface ObjectParseResult {
  _type: 'object';
  value: Record<string, unknown>;
}
```

### 解析结果与错误

```typescript
type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: ParseError };

interface ParseError {
  code: 'PARSE_ERROR';
  parser: string;
  message: string;
  expected: string;
  received: string;
}
```

### 配置类型

```typescript
interface ParserOptions {
  referencePrefixes?: string[];
  scopeNames?: string[];
  valueParsers?: Record<string, (body: string) => unknown>;
  keyParsers?: Record<string, (key: string, params?: Record<string, unknown>) => string>;
  onParsed?: (path: string, key: string, value: unknown) => void;
  onError?: (path: string, error: ParseError) => unknown;
  hooks?: ParserHooks;
  cache?: CacheOptions;
  debug?: DebugOptions;
}

interface ParserConfig {
  referencePrefixes: string[];
  scopeNames: string[];
  referenceRegex: RegExp;
  scopeRegex: RegExp;
  innerReferenceRegex: RegExp;
  innerScopeRegex: RegExp;
  valueParsers: Record<string, (body: string) => unknown>;
  keyParsers: Record<string, (key: string, params?: Record<string, unknown>) => string>;
  onParsed?: (path: string, key: string, value: unknown) => void;
  onError?: (path: string, error: ParseError) => unknown;
  hooks?: ParserHooks;
  cache?: CacheOptions;
  debug?: DebugOptions;
}

interface ParserHooks {
  beforeParse?: (path: string, value: unknown) => unknown | void;
  afterParse?: (path: string, original: unknown, parsed: unknown) => void;
  onError?: (path: string, error: ParseError) => unknown | void;
  transformResult?: (path: string, result: unknown) => unknown;
}
```

### 缓存与调试类型

```typescript
interface CacheOptions {
  enabled: boolean;
  maxSize?: number;   // 默认 1000
  ttl?: number;       // 默认 0（永不过期）
}

interface DebugOptions {
  enabled: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
  onTrace?: (trace: ParseTrace) => void;
}

interface ParseTrace {
  path: string;
  input: unknown;
  output: unknown;
  parser: string;
  duration: number;
  timestamp: number;
}
```

### Schema 验证类型

```typescript
type SchemaType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'any';

interface JsonSchema {
  type: SchemaType;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  additionalProperties?: boolean;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  nullable?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  path: string;
  message: string;
  expected: string;
  received: string;
}
```

## 正则表达式系统

引擎通过正则表达式识别 DSL 关键字的字符串模式。`regex-factory` 模块根据配置的前缀/作用域名动态生成：

```typescript
import {
  createReferenceRegex,
  createScopeRegex,
  createInnerReferenceRegex,
  createInnerScopeRegex,
} from '@json-engine/core-engine';

// 顶层引用：{{ref_state_count}}
const refRegex = createReferenceRegex(['props', 'state', 'computed']);
// → /^\{\{ref_(props|state|computed)_(.+)\}\}$/

// 顶层作用域：{{$_[core]_apiClient}}
const scopeRegex = createScopeRegex(['core', 'goal']);
// → /^\{\{\$_(core|goal)_(.+)\}\}$/

// 内部引用（无花括号）：ref_state_user.name
const innerRefRegex = createInnerReferenceRegex(['props', 'state', 'computed']);
// → /^ref_(props|state|computed)_([a-zA-Z_$][a-zA-Z0-9_$.]*)$/

// 内部作用域（无花括号）：$_[core]_apiClient
const innerScopeRegex = createInnerScopeRegex(['core', 'goal']);
// → /^\$_(core|goal)_([a-zA-Z_$][a-zA-Z0-9_$.]*)$/
```

这些正则用于解析对象字面量 `{{{ }}}` 内部的嵌套引用和作用域注入。

## 内置解析器

引擎内置六个值解析器，处理不同类型的 DSL 值：

| 解析器 | 处理类型 | 输入格式 | 输出节点 |
|--------|----------|----------|----------|
| `ValueReferenceParser` | `reference` | `{{ref_prefix_variable.path}}` | `{ _type: 'reference', ... }` |
| `ValueScopeParser` | `scope` | `{{$_[scope]_variable}}` | `{ _type: 'scope', ... }` |
| `ValueExpressionParser` | `expression` | `{{ expression }}` | `{ _type: 'expression', ... }` |
| `ValueFunctionParser` | `function` | `{{{params}}}`, `{{body}}` | `{ _type: 'function', ... }` |
| `ValueObjectParser` | `object` | `{{{ key: value }}}` | `{ _type: 'object', ... }` |
| `ValueConstraintParser` | `string` | `'string content'` | `{ _type: 'string', ... }` |

其中 `ValueObjectParser` 支持类 JSON 语法（键名无需引号），并自动将对象值中的 `ref_*` 和 `$_*` 模式解析为嵌套的引用/作用域节点。

## 架构原则

1. **无全局状态** — 一切通过 `ParserConfig` 对象传递，无全局副作用，确定性可复现
2. **判别联合类型** — 所有 AST 节点使用 `_type` 字段作为类型判别标记
3. **递归下降解析** — `walkJson` 遍历整棵 JSON 树，逐节点标准化、解析、转换
4. **钩子系统** — 五个钩子（`beforeParse`、`afterParse`、`transformResult`、`onParsed`、`onError`）提供完整的自定义能力
5. **可扩展解析器** — 通过 `valueParsers` 和 `keyParsers` 注册自定义解析逻辑
6. **调试与缓存** — 可选的 `DebugTracer` 记录每次解析的耗时和数据，`ParserCache` 支持 TTL 和最大容量淘汰

## 项目结构

```
src/packages/core-engine/
├── src/
│   ├── index.ts              # 公共 API 导出
│   ├── types.ts              # 核心 DSL 类型定义与六个内置值解析器
│   ├── parseJson.ts          # 主解析引擎（normalizeValue + walkJson + parseValueByType）
│   ├── config-factory.ts     # ParserConfig 构建器，生成正则表达式
│   ├── regex-factory.ts      # 动态正则表达式生成器
│   ├── schema-validator.ts   # 轻量级 JSON Schema 验证器
│   ├── debug.ts              # DebugTracer 调试追踪系统
│   └── cache.ts              # ParserCache LRU/TTL 缓存系统
├── package.json
├── tsconfig.json
└── MIGRATION.md              # 从旧版全局注册 API 迁移指南
```

## 迁移指南

从旧版全局注册 API 迁移到新版配置驱动 API，请参考 [MIGRATION.md](./MIGRATION.md)。主要变更：

- 全局注册表（`registerKeyParser` 等）替换为配置对象
- 引用结构从 `{ type: 'props', variable }` 改为 `{ _type: 'reference', prefix: 'props', variable }`
- 表达式结构从 `{ type: 'expression', body }` 改为 `{ _type: 'expression', expression }`
- 旧格式 `{ type: 'xxx', body: '...' }` 不再支持（结构化引用 `{ type: 'reference', prefix, variable }` 和作用域 `{ type: 'scope', scope, variable }` 除外）
