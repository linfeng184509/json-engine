# Migration Guide

This guide helps you migrate from the old core-engine API to the new plugin architecture.

## Overview

The new core-engine architecture introduces:
- **Config-based parsing** instead of global registry
- **Abstract type system** with `_type` markers
- **Dynamic regex factory** for custom prefixes and scopes
- **No global state** - fully deterministic parsing

## Breaking Changes

### 1. Global Registry Removed

**Before (deprecated):**
```typescript
import { registerKeyParser, unregisterKeyParser, clearKeyParsers } from '@json-engine/core-engine';

// Register a key parser globally
registerKeyParser('myKey', (key) => `prefix_${key}`);

// Later, clear it
unregisterKeyParser('myKey');
clearKeyParsers();
```

**After:**
```typescript
import { createParserConfig, parseJson } from '@json-engine/core-engine';

// Create config with key parsers
const config = createParserConfig({
  keyParsers: {
    myKey: (key) => `prefix_${key}`,
  },
});

// Use config - no global side effects
const result = parseJson(input, config);
```

### 2. Type Names Changed

| Old Name | New Name |
|----------|----------|
| `NestedReferenceData` | Use `AbstractReferenceParseData` or `AbstractScopeParseData` |
| `VariableParseData` | Use `AbstractReferenceParseData` |
| `NestedReferenceResult` | `string \| AbstractReferenceParseData \| AbstractScopeParseData` |

### 3. Reference Type Structure

**Before:**
```typescript
// PropsRef
{
  type: 'props',
  variable: 'value'
}
```

**After:**
```typescript
// PropsRef extends AbstractReferenceParseData
{
  _type: 'reference',
  prefix: 'props',
  variable: 'value'
}
```

### 4. Expression Type Structure

**Before:**
```typescript
{
  type: 'expression',
  body: '{{a + b}}'
}
```

**After:**
```typescript
// Output from parseJson
{
  _type: 'expression',
  expression: 'a + b'  // or typed reference/scope
}
```

## Migration Steps

### Step 1: Replace Global Registry with Config

```typescript
// Old
import { registerKeyParser, parseJson } from '@json-engine/core-engine';
registerKeyParser('onClick', transformEvent);
const result = parseJson(schema);

// New
import { createParserConfig, parseJson } from '@json-engine/core-engine';
const config = createParserConfig({
  keyParsers: {
    onClick: transformEvent,
  },
});
const result = parseJson(schema, config);
```

### Step 2: Update Type Imports

```typescript
// Old
import type { 
  NestedReferenceData,
  NestedReferenceResult,
  VariableParseData 
} from '@json-engine/core-engine';

// New
import type { 
  AbstractReferenceParseData,
  AbstractScopeParseData,
} from '@json-engine/core-engine';

type ExpressionResult = string | AbstractReferenceParseData | AbstractScopeParseData;
```

### Step 3: Handle `_type` Markers

```typescript
// Old: Check 'type' property
if (value.type === 'props') {
  const ref = value as PropsRef;
  doSomething(ref.variable);
}

// New: Check '_type' property
if (value._type === 'reference') {
  const ref = value as AbstractReferenceParseData;
  if (ref.prefix === 'props') {
    doSomething(ref.variable);
  }
}
```

### Step 4: Update Custom Parsers

If you had custom value parsers:

```typescript
// Old: Global registry
registerValueParser('myType', myParser);

// New: Config-based
const config = createParserConfig({
  valueParsers: {
    myType: (body) => myParser(body),
  },
});
```

## vue-json Migration

vue-json has been updated to use the new architecture:

```typescript
// vue-json now uses vueParserConfig internally
import { parseSchema } from '@json-engine/vue-json';

const result = parseSchema(schemaInput);
// Works automatically with new config system
```

## Timeline

- **v0.0.1**: Initial release with plugin architecture
- Global registry functions (`registerKeyParser`, etc.) are deprecated but still exported for backwards compatibility
- They will be removed in a future version

## Getting Help

If you encounter issues during migration:
1. Check the [API Reference](../README.md#api-reference)
2. Review the [type definitions](../src/types.ts)
3. Run tests to verify your changes
