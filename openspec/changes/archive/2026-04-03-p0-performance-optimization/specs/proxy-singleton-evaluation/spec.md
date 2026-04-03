## ADDED Requirements

### Requirement: Proxy singleton per render context
The system SHALL create `stateProxy` and `computedProxy` once per `RenderContext` and reuse them across all expression evaluations and directive applications within the same render cycle, eliminating redundant Proxy object creation.

#### Scenario: Single Proxy creation per context
- **WHEN** a component renders with 10 `v-bind` directives and 3 `v-if` conditions
- **THEN** only one `stateProxy` and one `computedProxy` are created for the entire render, instead of 13+ separate Proxy instances

#### Scenario: Proxy reuse across directive types
- **WHEN** `applyVIf()`, `applyVBind()`, `applyVHtml()`, and `evaluateStringExpression()` are called within the same render context
- **THEN** all functions use the same `stateProxy` and `computedProxy` from the context

#### Scenario: Proxy produces identical behavior to per-call creation
- **WHEN** an expression is evaluated using a shared proxy versus a freshly created proxy
- **THEN** both produce identical results (same `.value` unwrapping, same ref detection)

#### Scenario: Different components use different proxies
- **WHEN** two separate component instances render concurrently
- **THEN** each component's render context has its own `stateProxy` and `computedProxy` bound to its own state

### Requirement: RenderContext proxy fields
The `RenderContext` type SHALL include optional `stateProxy` and `computedProxy` fields that hold pre-created Proxy wrappers for the component's state and computed objects.

#### Scenario: Context includes proxy fields
- **WHEN** a `RenderContext` is constructed in `component-creator.ts` `setup()`
- **THEN** it includes `stateProxy` and `computedProxy` fields created via `createStateProxy()`

#### Scenario: Backward compatibility for context without proxies
- **WHEN** a `RenderContext` is passed without `stateProxy` or `computedProxy` fields
- **THEN** expression evaluation and directive functions fall back to creating proxies on-demand (backward compatible)
