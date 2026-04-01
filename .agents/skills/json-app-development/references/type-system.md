# Type System - 类型系统详解

本文档定义 core-engine 的类型系统、解析规则和类型守卫。

---

## 核心类型系统

### Discriminated Union 模式

所有解析后的值使用 `_type` 作为类型标识符，实现类型安全匹配：

```typescript
type ParseDataType =
  | StringParseData
  | ObjectParseResult
  | AbstractScopeParseData
  | AbstractReferenceParseData
  | ExpressionParseData
  | FunctionParseData;
```

每种类型都有唯一的 `_type` 值，支持 TypeScript 类型守卫。

---

## 输入类型与输出类型对照

### ValueBody 输入类型

```typescript
type ValueBodyType = 'string' | 'scope' | 'reference' | 'expression' | 'object' | 'function';

interface ValueBody {
  type: ValueBodyType;
  body: string;
}
```

### 输入 → 输出转换规则

| 输入格式 | 输出 `_type` | 解析结果 |
|----------|--------------|----------|
| `{ type: 'string', body: "'hello'" }` | `string` | `{ _type: 'string', value: 'hello' }` |
| `{ type: 'scope', body: '{{$_core_api}}' }` | `scope` | `{ _type: 'scope', scope: 'core', variable: 'api' }` |
| `{ type: 'reference', body: '{{ref_state_count}}' }` | `reference` | `{ _type: 'reference', prefix: 'state', variable: 'count' }` |
| `{ type: 'expression', body: '{{a + b}}' }` | `expression` | `{ _type: 'expression', expression: 'a + b' }` |
| `{ type: 'function', params: '{}', body: '...' }` | `function` | `{ _type: 'function', params: {}, body: '...' }` |
| `{ type: 'object', body: '{{{ \"key\": \"value\" }}}" }` | `object` | `{ _type: 'object', value: { "key": "value" } }` |

---

## 类型详细定义

### StringParseData

```typescript
interface StringParseData {
  _type: 'string';
  value: string;
}
```

**解析规则**:
- 输入 body 必须是单引号或双引号包裹的字符串
- `"'hello'"` → `value: 'hello'`
- `"\"world\""` → `value: 'world'`

```json
// 输入
{ "type": "string", "body": "'Hello World'" }

// 输出
{ "_type": "string", "value": "Hello World" }
```

---

### AbstractScopeParseData

```typescript
interface AbstractScopeParseData {
  _type: 'scope';
  scope: string;      // scope 名称：'core' | 'goal' | 自定义
  variable: string;   // 变量名
}
```

**语法格式**: `{{$_scope_variable}}`

**解析规则**:
- `[scope]` 必须是有效的 scope 名称
- `variable` 是该 scope 下的属性名

```json
// 输入
{ "type": "scope", "body": "{{$_core_api}}" }

// 输出
{ "_type": "scope", "scope": "core", "variable": "api" }
```

---

### AbstractReferenceParseData

```typescript
interface AbstractReferenceParseData {
  _type: 'reference';
  prefix: string;     // 引用前缀：'props' | 'state' | 'computed'
  variable: string;   // 变量名
  path?: string;      // 可选：嵌套路径
}
```

**语法格式**: `{{ref_prefix_variable[.path]}}`

**解析规则**:
- `prefix` 必须是已配置的引用前缀（默认：props, state, computed）
- `variable` 是该前缀下的变量名
- `path` 用于嵌套访问（可选）

```json
// 输入 - 简单引用
{ "type": "reference", "body": "{{ref_state_count}}" }

// 输出
{ "_type": "reference", "prefix": "state", "variable": "count" }

// 输入 - 嵌套路径
{ "type": "reference", "body": "{{ref_state_user.name}}" }

// 输出
{ "_type": "reference", "prefix": "state", "variable": "user", "path": "name" }
```

---

### ExpressionParseData

```typescript
interface ExpressionParseData {
  _type: 'expression';
  expression: string | AbstractReferenceParseData | AbstractScopeParseData;
}
```

**语法格式**: `{{expression}}`

**解析规则**:
- 表达式内部可以是任意合法的 JavaScript 表达式
- 表达式内部的引用会被进一步解析

```json
// 输入 - 简单表达式
{ "type": "expression", "body": "{{a + b}}" }

// 输出
{ "_type": "expression", "expression": "a + b" }

// 输入 - 包含引用的表达式
{ "type": "expression", "body": "{{ref_state_count * 2}}" }

// 输出（引用被解析）
{ 
  "_type": "expression", 
  "expression": { 
    "_type": "reference", 
    "prefix": "state", 
    "variable": "count",
    "transform": "* 2"  // 表达式部分
  } 
}
```

---

### FunctionParseData

```typescript
interface FunctionParseData {
  _type: 'function';
  params: Record<string, unknown>;
  body: string;
}
```

**语法格式**:
```json
{
  "type": "function",
  "params": "{{{ \"arg1\": value1, \"arg2\": value2 }}}",
  "body": "{{return statement}}"
}
```

**解析规则**:
- `params` 是 JSON 格式的参数对象
- `body` 是函数体代码字符串
- params 会被解析为对象

```json
// 输入
{
  "type": "function",
  "params": "{{{ \"event\": \"click\" }}}",
  "body": "{{handleClick(event)}}"
}

// 输出
{
  "_type": "function",
  "params": { "event": "click" },
  "body": "handleClick(event)"
}
```

---

### ObjectParseResult

```typescript
interface ObjectParseResult {
  _type: 'object';
  value: Record<string, unknown>;
}
```

**语法格式**: `{{{ key1: value1, key2: value2, ... }}}`

**解析规则**:
- 支持多键值对对象
- 支持 JSON 格式的值（字符串、数字、布尔值、null、对象、数组）
- 支持 `"ref_state_xxx"`、`"ref_props_xxx"`、`"ref_computed_xxx"` 引用
- 支持 `"$_core_xxx"`、`"$_goal_xxx"` scope 引用
- 支持嵌套对象和数组
- 支持引用值在对象、数组中的递归解析

**正确示例**:

```json
// 静态对象
{ "type": "object", "body": "{{{ \"padding\": \"24px\", \"margin\": \"16px\" }}}" }

// 包含引用
{ "type": "object", "body": "{{{ \"name\": \"ref_state_userName\", \"age\": \"ref_state_age\" }}}" }

// 混合值
{ "type": "object", "body": "{{{ \"padding\": \"24px\", \"active\": true, \"count\": 10, \"name\": \"ref_state_name\" }}}" }

// 嵌套对象
{ "type": "object", "body": "{{{ \"style\": { \"padding\": \"24px\" }, \"active\": true }}}" }

// 数组
{ "type": "object", "body": "{{{ \"items\": [1, 2, 3], \"names\": [\"a\", \"b\"] }}}" }

// 数组中的引用
{ "type": "object", "body": "{{{ \"items\": [\"ref_state_item1\", \"ref_state_item2\"] }}}" }
```

**输出示例**:

```json
// 输入
{ "type": "object", "body": "{{{ \"padding\": \"24px\", \"name\": \"ref_state_userName\" }}}" }

// 输出
{ 
  "_type": "object", 
  "value": {
    "padding": "24px",
    "name": { "_type": "reference", "prefix": "state", "variable": "userName" }
  }
}
```

---

## 类型守卫 (Type Guards)

### 可用守卫函数

```typescript
function isStringParseData(value: unknown): value is StringParseData;
function isScopeParseData(value: unknown): value is AbstractScopeParseData;
function isReferenceParseData(value: unknown): value is AbstractReferenceParseData;
function isExpressionParseData(value: unknown): value is ExpressionParseData;
function isFunctionParseData(value: unknown): value is FunctionParseData;
function isObjectParseResult(value: unknown): value is ObjectParseResult;
```

### 使用示例

```typescript
import { 
  parseJson, 
  isReferenceParseData, 
  isScopeParseData 
} from '@json-engine/core-engine';

const result = parseJson({
  value: { type: 'reference', body: '{{ref_props_userId}}' }
});

const parsedValue = result.value;

if (isReferenceParseData(parsedValue)) {
  // TypeScript 知道 parsedValue 是 AbstractReferenceParseData
  console.log(`Reference: ${parsedValue.prefix}.${parsedValue.variable}`);
  if (parsedValue.path) {
    console.log(`Path: ${parsedValue.path}`);
  }
}
```

---

## 解析规则汇总

### 规则 ID | 规则描述

| ID | 规则 |
|----|------|
| **T01** | 所有解析值必须有 `_type` 字段 |
| **T02** | `_type` 必须是有效的类型标识符 |
| **T03** | string 类型的 body 必须是引号包裹的字符串 |
| **T04** | scope 类型的 body 必须匹配 `{{$_scope_var}}` 格式 |
| **T05** | reference 类型的 body 必须匹配 `{{ref_prefix_var}}` 格式 |
| **T06** | function 类型的 params 必须是有效的 JSON 对象 |
| **T07** | function 类型的 body 必须是有效的代码字符串 |
| **T08** | 嵌套路径使用 `.` 分隔，支持多级 |

---

## 自定义值解析器

### ValueParserRegistry

```typescript
interface ValueParserRegistry {
  [typeName: string]: ValueParserFn;
}

type ValueParserFn = (body: string) => unknown;
```

### 注册自定义解析器

```typescript
import { createParserConfig, parseJson } from '@json-engine/core-engine';

const config = createParserConfig({
  valueParsers: {
    // 自定义 date 类型解析器
    date: (body) => ({
      _type: 'date',
      timestamp: new Date(body).getTime(),
      formatted: new Date(body).toISOString()
    }),
    
    // 自定义 color 类型解析器
    color: (body) => ({
      _type: 'color',
      hex: body,
      rgb: hexToRgb(body)
    })
  }
});

const result = parseJson({
  createdAt: { type: 'date', body: '2024-01-15' },
  themeColor: { type: 'color', body: '#1677ff' }
}, config);

// 输出
{
  createdAt: { _type: 'date', timestamp: 1705276800000, formatted: '2024-01-15T00:00:00.000Z' },
  themeColor: { _type: 'color', hex: '#1677ff', rgb: { r: 22, g: 119, b: 255 } }
}
```

### 自定义解析器规则

| 规则 ID | 规则 |
|---------|------|
| **T09** | 自定义解析器必须返回带 `_type` 的对象 |
| **T10** | 自定义 `_type` 不应与内置类型冲突 |
| **T11** | 解析器应该是纯函数（无副作用） |

---

## 正则表达式工厂

### 引用正则

```typescript
// 默认: ref_(props|state|computed)_<variable>[.<path>]
const referenceRegex = /^{{ref_(props|state|computed)_(.+)}}$/;

// 匹配示例
'{{ref_state_count}}'        → prefix: 'state', variable: 'count'
'{{ref_props_title}}'        → prefix: 'props', variable: 'title'
'{{ref_state_user.name}}'    → prefix: 'state', variable: 'user.name'
```

### Scope 正则

```typescript
// 默认: $_core|goal_<variable>
const scopeRegex = /^{{\$_(core|goal)_(.+)}}$/;

// 匹配示例
'{{$_core_api}}'    → scope: 'core', variable: 'api'
'{{$_goal_target}}' → scope: 'goal', variable: 'target'
```

### 自定义前缀配置

```typescript
const config = createParserConfig({
  referencePrefixes: ['props', 'state', 'computed', 'api', 'store'],
  scopeNames: ['core', 'goal', 'global', 'local']
});

// 新的正则会自动生成
'{{ref_api_users}}'      → prefix: 'api', variable: 'users'
'{{$_global_config}}'  → scope: 'global', variable: 'config'
```

---

## 解析流程

```
输入 JSON
    │
    ▼
parseJson(input, config)
    │
    ├─ createParserConfig(config) → ParserConfig
    │
    ▼
parseValueByType(value, config)
    │
    ├─ 检查 value.type
    │   ├─ 'string' → ValueStringParser
    │   ├─ 'scope' → ValueScopeParser
    │   ├─ 'reference' → ValueReferenceParser
    │   ├─ 'expression' → ValueExpressionParser
    │   ├─ 'function' → ValueFunctionParser
    │   ├─ 'object' → ValueObjectParser
    │   └─ custom → valueParsers[typeName]
    │
    ▼
walkJson(parsed, config, path)
    │
    ├─ 数组 → 递归遍历每个元素
    ├─ 对象 → 
    │   ├─ parseKey(key, keyParsers)
    │   ├─ parseValueByType(value, config)
    │   ├─ walkJson(parsedValue, config, newPath)
    │   └─ 触发 onParsed 回调
    │
    ▼
输出 Parsed JSON
```

---

## 错误处理

### ParseResult 结构

```typescript
interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}
```

### 错误类型

| 错误类型 | 触发条件 |
|----------|----------|
| `InvalidTypeError` | 未知的 type 值 |
| `ParseError` | body 格式不符合预期 |
| `ConfigError` | 配置无效 |

### 错误处理示例

```typescript
import { parseJson, createError } from '@json-engine/core-engine';

const result = parseJson(schema, config);

if (!result.success) {
  console.error('Parse failed:', result.error?.message);
  // 处理错误
}
```

---

## 规则汇总

| ID | 领域 | 规则 |
|----|------|------|
| T01 | 输出 | 所有解析值必须有 `_type` |
| T02 | 输出 | `_type` 必须是有效类型 |
| T03 | string | body 必须引号包裹 |
| T04 | scope | 必须匹配 `$_scope_var` |
| T05 | reference | 必须匹配 `ref_prefix_var` |
| T06 | function | params 必须有效 JSON |
| T07 | function | body 必须有效代码 |
| T08 | path | 嵌套用 `.` 分隔 |
| T09 | 自定义 | 返回带 `_type` 对象 |
| T10 | 自定义 | 不与内置类型冲突 |
| T11 | 自定义 | 纯函数无副作用 |