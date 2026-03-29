## Context

The vue-json-playground example files use state/props reference formats that do not comply with core-engine design specifications. The core-engine defines that all references should use `ref_state_xxx` or `ref_props_xxx` format, but the examples mix multiple formats including:

- Direct JavaScript access (`state.xxx.value`, `props.xxx`)
- Undefined reference types (`ref_computed_xxx`)
- Inconsistent vModel bindings
- Direct vFor variable access without proper reference format

The core-engine's `parseNestedReference` function already supports dot notation in regex patterns, but vue-json runtime does not properly handle the parsed results for nested property access.

## Goals / Non-Goals

**Goals:**
- Fix all JSON example files to use core-engine compliant reference formats
- Add runtime support for dot-path references (`ref_state_formData.name`)
- Add runtime support for function body reference transformation with automatic ref/reactive handling
- Ensure backward compatibility with existing non-dot-path references

**Non-Goals:**
- Modifying core-engine package (it already supports dot-path in regex)
- Adding new reference types to core-engine
- Changing the core-engine specification

## Decisions

### Decision 1: Dot-Path Reference Format

**Format:** `ref_state_<variable>.<path>` and `ref_props_<variable>.<path>`

**Examples:**
- `ref_state_count` → `state.count.value`
- `ref_state_formData.name` → `state.formData.value.name` (ref) or `state.formData.name` (reactive)
- `ref_props_title` → `props.title`

**Rationale:** Core-engine regex already captures the full match including dots. The vue-json parser needs to split the variable from the path and pass both to runtime.

**Alternatives Considered:**
- Separate type for nested references - rejected as it adds complexity without benefit
- No dot-path support, force flat state - rejected as it limits expressiveness

### Decision 2: Function Body Reference Transformation

**Approach:** Replace `ref_state_xxx` patterns in function body strings at runtime with proper JavaScript code.

**Transformation Rules:**
| Reference | Ref Type | Transform To |
|-----------|----------|--------------|
| `ref_state_xxx` | ref | `state.xxx.value` |
| `ref_state_xxx` | reactive | `state.xxx` |
| `ref_state_xxx.yyy` | ref | `state.xxx.value.yyy` |
| `ref_state_xxx.yyy` | reactive | `state.xxx.yyy` |
| `ref_props_xxx` | - | `props.xxx` |

**Rationale:** Function body is pure JavaScript code that gets executed via `new Function()`. References must be transformed to actual JavaScript expressions that access the runtime context.

### Decision 3: Computed Access in Function Body

**Format:** `computed.xxx.value` (direct JavaScript, no transformation)

**Rationale:** Computed properties are accessed directly from the context and are not part of the core-engine reference specification. They should use standard JavaScript property access.

### Decision 4: vFor Loop Variable Handling

**Approach:** vFor alias is injected into `state` context by `applyVFor`, so references use `ref_state_<alias>` format.

**Example:**
```json
{
  "vFor": { "source": "...", "alias": "todo" },
  "children": { "type": "expression", "body": "{{ref_state_todo.text}}" }
}
```

**Rationale:** Consistency with other state references. The runtime already injects loop variables into state context.

## Risks / Trade-offs

### Risk 1: Ref vs Reactive Confusion
- **Risk:** Function body transformation needs to know if a state variable is `ref` or `reactive` to add `.value` correctly
- **Mitigation:** Pass `stateTypes` map in context from component-factory based on state definition

### Risk 2: Backward Compatibility
- **Risk:** Existing code using `state.xxx` directly in function bodies will break
- **Mitigation:** This is acceptable as it was never compliant with core-engine specification

### Risk 3: Complex Nested Paths
- **Risk:** Deep nesting like `ref_state_obj.prop1.prop2.prop3` may have edge cases
- **Mitigation:** Handle recursively with proper null checks in `getNestedValue`