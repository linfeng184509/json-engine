# @json-engine/core-engine

Framework-agnostic JSON parsing engine with plugin architecture.

## Features

- **DSL Syntax**: Define references, expressions, functions, and objects in JSON
- **Abstract Type System**: Framework-independent types for references, scopes, and expressions
- **Plugin Architecture**: Configurable parsers via `ParserConfig` - no global state
- **Dynamic Regex Factory**: Create custom reference prefixes and scope names
- **Type Safety**: All parsed values include `_type` markers for runtime type checking
- **Lifecycle Hooks**: `beforeParse`, `afterParse`, `onError`, `transformResult`
- **Caching**: Configurable parser cache with TTL and max size
- **Debug Tracing**: Parse trace with performance metrics
- **Schema Validation**: JSON Schema validation support

## Installation

```bash
npm install @json-engine/core-engine
```

## Quick Start

```typescript
import { parseJson, createParserConfig } from '@json-engine/core-engine';

const config = createParserConfig({
  referencePrefixes: ['props', 'state', 'computed'],
  scopeNames: ['core', 'goal'],
});

const input = {
  name: 'MyComponent',
  props: {
    value: { type: 'reference', body: '{{ref_props_value}}' },
  },
  children: [
    { type: 'span', text: '{{ref_state_count}}' },
  ],
};

const result = parseJson(input, config);
```

## DSL Syntax

core-engine uses special patterns inside JSON values to express dynamic references, expressions, and functions.

### Input Format

Values must be wrapped in a `{ type, body }` structure:

```json
{
  "type": "reference",
  "body": "{{ref_state_count}}"
}
```

Supported `type` values: `string`, `reference`, `scope`, `expression`, `object`, `function`

### Syntax Reference

| Type | Syntax Pattern | Input Example | Parsed Output |
|------|----------------|---------------|---------------|
| **Reference** | `{{ref_<prefix>_<variable>}}` | `{ type: "reference", body: "{{ref_state_count}}" }` | `{ _type: "reference", prefix: "state", variable: "count" }` |
| **Reference (path)** | `{{ref_<prefix>_<variable>.<path>}}` | `{ type: "reference", body: "{{ref_props_user.name}}" }` | `{ _type: "reference", prefix: "props", variable: "user", path: "name" }` |
| **Scope** | `{{$_<scope>_<variable>}}` | `{ type: "scope", body: "{{$_core_api}}" }` | `{ _type: "scope", scope: "core", variable: "api" }` |
| **Expression** | `{{<expression>}}` | `{ type: "expression", body: "{{a + b}}" }` | `{ _type: "expression", expression: "a + b" }` |
| **Function** | `{{{<params>}}}` + `{{<body>}}` | `{ type: "function", params: "{{{\"x\":1}}}", body: "{{return x}}" }` | `{ _type: "function", params: {x:1}, body: "return x" }` |
| **Object** | `{{{ <json> }}}` | `{ type: "object", body: "{{{\"padding\":\"24px\"}}}" }` | `{ _type: "object", value: { padding: "24px" } }` |
| **String** | `'<value>'` | `{ type: "string", body: "'hello'" }` | `{ _type: "string", value: "hello" }` |

### Default Configuration

```typescript
referencePrefixes: ['props', 'state', 'computed']
scopeNames: ['core', 'goal']
```

### Reference Examples

```typescript
// State reference
{ type: 'reference', body: '{{ref_state_count}}' }
// → { _type: 'reference', prefix: 'state', variable: 'count' }

// Props reference with nested path
{ type: 'reference', body: '{{ref_props_user.name}}' }
// → { _type: 'reference', prefix: 'props', variable: 'user', path: 'name' }

// Computed reference
{ type: 'reference', body: '{{ref_computed_doubled}}' }
// → { _type: 'reference', prefix: 'computed', variable: 'doubled' }
```

### Scope Examples

```typescript
// Core scope
{ type: 'scope', body: '{{$_core_api}}' }
// → { _type: 'scope', scope: 'core', variable: 'api' }

// Goal scope
{ type: 'scope', body: '{{$_goal_target}}' }
// → { _type: 'scope', scope: 'goal', variable: 'target' }
```

### Expression Examples

```typescript
// Simple expression
{ type: 'expression', body: '{{a + b}}' }
// → { _type: 'expression', expression: 'a + b' }

// Expression with reference (auto-resolved)
{ type: 'expression', body: '{{ref_state_count}}' }
// → { _type: 'expression', expression: { _type: 'reference', prefix: 'state', variable: 'count' } }

// Mixed expression (kept as string)
{ type: 'expression', body: '{{ref_state_count}} * 2' }
// → { _type: 'expression', expression: 'ref_state_count * 2' }
```

### Function Examples

```typescript
// Function with empty params
{ type: 'function', params: '{{{}}}', body: '{{return x}}' }
// → { _type: 'function', params: {}, body: 'return x' }

// Function with params
{ type: 'function', params: '{{{ {"x": 123} }}}', body: '{{return x}}' }
// → { _type: 'function', params: { x: 123 }, body: 'return x' }
```

### Object Examples

```typescript
// Simple object
{ type: 'object', body: '{{{ "padding": "24px", "margin": "16px" }}}' }
// → { _type: 'object', value: { padding: '24px', margin: '16px' } }

// Object with references (auto-resolved)
{ type: 'object', body: '{{{ "name": "ref_state_userName" }}}' }
// → { _type: 'object', value: { name: { _type: 'reference', prefix: 'state', variable: 'userName' } } }

// Nested object
{ type: 'object', body: '{{{ "style": { "padding": "24px" } }}}' }
// → { _type: 'object', value: { style: { padding: '24px' } } }
```

### Inner References (Inside Objects)

When parsing objects, inner references use a simplified format without `{{ }}`:

```typescript
// Inner reference format: ref_<prefix>_<variable>
"ref_state_count"       → { _type: 'reference', prefix: 'state', variable: 'count' }
"ref_props_user.name"   → { _type: 'reference', prefix: 'props', variable: 'user', path: 'name' }

// Inner scope format: $_<scope>_<variable>
"$_core_api"            → { _type: 'scope', scope: 'core', variable: 'api' }
```

## API Reference

### parseJson(input, config?)

Parses a JSON object, converting structured values based on the config.

```typescript
import { parseJson } from '@json-engine/core-engine';

const result = parseJson(input, config);
```

### createParserConfig(options?)

Creates a `ParserConfig` object with default or custom settings.

```typescript
interface ParserOptions {
  referencePrefixes?: string[];    // Default: ['props', 'state', 'computed']
  scopeNames?: string[];           // Default: ['core', 'goal']
  valueParsers?: ValueParserRegistry;
  keyParsers?: KeyParserRegistry;
  onParsed?: ParseCallback;
  onError?: ErrorCallback;
  hooks?: ParserHooks;
  cache?: CacheOptions;
}
```

### Parser Hooks

```typescript
const config = createParserConfig({
  hooks: {
    beforeParse: (path, value) => {
      console.log(`Parsing: ${path}`);
      return value;  // Return modified value or void
    },
    afterParse: (path, original, parsed) => {
      console.log(`Parsed: ${path}`);
    },
    onError: (path, error) => {
      console.error(`Error at ${path}:`, error.message);
      return null;  // Return fallback value
    },
    transformResult: (path, result) => {
      return result;  // Transform final result
    },
  },
});
```

### ParserCache

```typescript
import { createParserCache } from '@json-engine/core-engine';

const cache = createParserCache({
  enabled: true,
  maxSize: 1000,    // Max cache entries
  ttl: 60000,       // TTL in ms (0 = no expiry)
});

cache.set('key', value);
const cached = cache.get('key');
const computed = cache.getOrCompute('key', () => expensiveComputation());
```

### DebugTracer

```typescript
import { createDebugTracer } from '@json-engine/core-engine';

const tracer = createDebugTracer({
  enabled: true,
  logLevel: 'debug',  // 'error' | 'warn' | 'info' | 'debug'
  onTrace: (trace) => {
    console.log(`${trace.path}: ${trace.duration.toFixed(2)}ms`);
  },
});

const traces = tracer.getTraces();
const slow = tracer.getSlowTraces(10);  // > 10ms
```

### Schema Validation

```typescript
import { validateSchema, createJsonSchema } from '@json-engine/core-engine';

const schema = createJsonSchema({
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    age: { type: 'number', minimum: 0 },
    email: { type: 'string', pattern: '^[^@]+@[^@]+$' },
  },
  required: ['name', 'age'],
  additionalProperties: false,
});

const result = validateSchema(input, schema);
// { valid: boolean, errors: ValidationError[] }
```

### Regex Factory Functions

```typescript
import {
  createReferenceRegex,
  createScopeRegex,
  createInnerReferenceRegex,
  createInnerScopeRegex,
} from '@json-engine/core-engine';

const refRegex = createReferenceRegex(['props', 'state']);
const scopeRegex = createScopeRegex(['core', 'goal']);
const innerRefRegex = createInnerReferenceRegex(['props', 'state']);
const innerScopeRegex = createInnerScopeRegex(['core', 'goal']);
```

### Type Guards

```typescript
import {
  isReferenceParseData,
  isScopeParseData,
  isExpressionParseData,
  isFunctionParseData,
  createTypeGuard,
} from '@json-engine/core-engine';

if (isReferenceParseData(value)) {
  console.log(value.prefix, value.variable);
}

// Create custom type guard
const isCustomType = createTypeGuard<{ _type: 'custom'; data: string }>('custom');
```

## Type System

### AbstractReferenceParseData

```typescript
interface AbstractReferenceParseData {
  _type: 'reference';
  prefix: string;    // e.g., 'props', 'state', 'computed'
  variable: string;
  path?: string;     // For nested access like 'user.name'
}
```

### AbstractScopeParseData

```typescript
interface AbstractScopeParseData {
  _type: 'scope';
  scope: string;      // e.g., 'core', 'goal'
  variable: string;
}
```

### ExpressionParseData

```typescript
interface ExpressionParseData {
  _type: 'expression';
  expression: string | AbstractReferenceParseData | AbstractScopeParseData;
}
```

### FunctionParseData

```typescript
interface FunctionParseData {
  _type: 'function';
  params: Record<string, unknown>;
  body: string;
}
```

### ObjectParseResult

```typescript
interface ObjectParseResult {
  _type: 'object';
  value: Record<string, unknown>;
}
```

### StringParseData

```typescript
interface StringParseData {
  _type: 'string';
  value: string;
}
```

### ParseError

```typescript
interface ParseError {
  code: string;
  parser: string;
  message: string;
  expected: string;
  received: string;
}
```

## Architecture

```
core-engine
├── types.ts             # Abstract type definitions and parsers
├── regex-factory.ts     # Dynamic regex generation
├── config-factory.ts    # ParserConfig creation
├── parseJson.ts         # Main parsing logic
├── cache.ts             # ParserCache implementation
├── debug.ts             # DebugTracer implementation
├── schema-validator.ts  # JSON Schema validation
└── index.ts             # Public exports
```

## License

MIT
