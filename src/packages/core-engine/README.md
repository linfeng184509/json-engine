# @json-engine/core-engine

Framework-agnostic JSON parsing engine with plugin architecture.

## Features

- **Abstract Type System**: Framework-independent types for references, scopes, and expressions
- **Plugin Architecture**: Configurable parsers via `ParserConfig` - no global state
- **Dynamic Regex Factory**: Create custom reference prefixes and scope names
- **Type Safety**: All parsed values include `_type` markers for runtime type checking

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
  keyParsers: {
    myKey: (key) => `prefix_${key}`,
  },
});

const input = {
  name: 'MyComponent',
  props: {
    value: { type: 'reference', body: '{{ref_props_value}}' },
  },
};

const result = parseJson(input, config);
```

## API Reference

### createParserConfig(options?)

Creates a `ParserConfig` object with default or custom settings.

```typescript
interface ParserOptions {
  referencePrefixes?: string[];  // Default: ['props', 'state', 'computed']
  scopeNames?: string[];         // Default: ['core', 'goal']
  valueParsers?: ValueParserRegistry;
  keyParsers?: KeyParserRegistry;
  onParsed?: ParseCallback;
}
```

### parseJson(input, config?)

Parses a JSON object, converting structured values based on the config.

```typescript
const result = parseJson(input, config);
```

### Regex Factory Functions

```typescript
// Create regex for reference patterns
const refRegex = createReferenceRegex(['props', 'state']);

// Create regex for scope patterns
const scopeRegex = createScopeRegex(['core', 'goal']);

// Create regex for inner reference (without braces)
const innerRefRegex = createInnerReferenceRegex(['props', 'state']);

// Create regex for inner scope (without braces)
const innerScopeRegex = createInnerScopeRegex(['core', 'goal']);
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

## Migration Guide

### From Global Registry to Config-based

**Old API (deprecated):**
```typescript
import { registerKeyParser, parseJson } from '@json-engine/core-engine';

registerKeyParser('myKey', (key) => `parsed_${key}`);
const result = parseJson(input);
```

**New API:**
```typescript
import { createParserConfig, parseJson } from '@json-engine/core-engine';

const config = createParserConfig({
  keyParsers: {
    myKey: (key) => `parsed_${key}`,
  },
});
const result = parseJson(input, config);
```

### Type Changes

| Old Type | New Type |
|----------|----------|
| `NestedReferenceData` | `AbstractReferenceParseData` or `AbstractScopeParseData` |
| `VariableParseData` | `AbstractReferenceParseData` |
| `PropsRef.variable` | `PropsRef.variable` (still available via prefix) |

## Architecture

```
core-engine
├── types.ts          # Abstract type definitions
├── regex-factory.ts  # Dynamic regex generation
├── config-factory.ts # ParserConfig creation
├── parseJson.ts      # Main parsing logic
└── index.ts          # Public exports
```

## License

MIT
