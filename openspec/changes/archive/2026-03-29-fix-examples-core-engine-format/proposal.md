## Why

The JSON example files in `vue-json-playground/src/examples/` do not comply with core-engine design specifications. Specifically:

1. **Expression value references** use `ref_computed_xxx` which is not defined in core-engine
2. **Function body state access** uses `state.xxx.value` instead of `ref_state_xxx` format
3. **vModel bindings** use incorrect reference format
4. **vFor loop variables** use direct variable names instead of `ref_state_xxx` format

This violates the core-engine design principle that all state/props references must use the `ref_state_xxx` or `ref_props_xxx` format for consistency and proper runtime handling.

## What Changes

- **Fix expression references**: Replace `ref_computed_xxx` with `computed.xxx.value` expressions
- **Fix function body references**: Replace `state.xxx.value` with `ref_state_xxx` format
- **Fix props references**: Replace `props.xxx` with `ref_props_xxx` format
- **Fix vModel bindings**: Use proper dot-path references like `ref_state_formData.name`
- **Fix vFor loop variables**: Use `ref_state_<alias>` format for loop variable access
- **Add dot-path support**: Enable `ref_state_formData.name` style nested property access
- **Add runtime state type awareness**: Distinguish `ref` vs `reactive` for proper `.value` handling

## Capabilities

### New Capabilities

- `dot-path-reference`: Support dot notation in state/props references (e.g., `ref_state_formData.name`)
- `function-body-transform`: Transform `ref_state_xxx` references in function bodies with automatic ref/reactive handling

### Modified Capabilities

- None (this is a new feature implementation, not a modification of existing requirements)

## Impact

**Affected Packages:**
- `@json-engine/vue-json`: Runtime value resolution and expression evaluation
- `@json-engine/vue-json-playground`: Example JSON files

**Affected Files:**
- `src/packages/vue-json/src/types/runtime.ts` - Add `stateTypes` field
- `src/packages/vue-json/src/types/schema.ts` - Add `path?` field to StateRef/PropsRef
- `src/packages/vue-json/src/parser/index.ts` - Parse dot-path references
- `src/packages/vue-json/src/runtime/component-factory.ts` - Pass stateTypes to context
- `src/packages/vue-json/src/runtime/value-resolver.ts` - Add dot-path support and function body transform
- `src/packages/vue-json-playground/src/examples/counter.json` - Fix references
- `src/packages/vue-json-playground/src/examples/form.json` - Fix references
- `src/packages/vue-json-playground/src/examples/todo-list.json` - Fix references

**Breaking Changes:** None - this is backward compatible as existing non-dot-path references continue to work.