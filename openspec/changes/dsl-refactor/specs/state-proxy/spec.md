## ADDED Requirements

### Requirement: State Proxy auto-unwraps ref values on get

The system SHALL create a Proxy wrapper around the state object that automatically unwraps `.value` from Vue ref objects when accessed. When code reads `state.count`, the Proxy SHALL return `state.count.value` if `state.count` is a ref.

#### Scenario: Read ref state through Proxy
- **WHEN** state contains `count: ref(0)` and code accesses `state.count`
- **THEN** the Proxy returns `0` (the ref's `.value`)

#### Scenario: Read reactive state through Proxy
- **WHEN** state contains `user: reactive({ name: 'test' })` and code accesses `state.user`
- **THEN** the Proxy returns the reactive object directly (no `.value` unwrapping)

#### Scenario: Read nested property through Proxy
- **WHEN** state contains `user: reactive({ profile: { email: 'test@example.com' } })` and code accesses `state.user.profile.email`
- **THEN** the Proxy returns `'test@example.com'`

### Requirement: State Proxy auto-wraps ref values on set

The system SHALL create a Proxy that automatically writes to `.value` when setting a ref-based state variable. When code writes `state.count = 5`, the Proxy SHALL set `state.count.value = 5` if `state.count` is a ref.

#### Scenario: Write ref state through Proxy
- **WHEN** state contains `count: ref(0)` and code executes `state.count = 5`
- **THEN** the Proxy sets `state.count.value = 5`

#### Scenario: Write reactive state through Proxy
- **WHEN** state contains `config: reactive({ theme: 'light' })` and code executes `state.config.theme = 'dark'`
- **THEN** the Proxy sets the property directly on the reactive object

#### Scenario: Replace reactive state through Proxy
- **WHEN** state contains `items: ref([])` and code executes `state.items = [1, 2, 3]`
- **THEN** the Proxy sets `state.items.value = [1, 2, 3]`

### Requirement: State Proxy preserves ref identity

The system SHALL ensure that the Proxy does not break Vue's reactivity tracking. When code accesses `state.count` through the Proxy, Vue's reactivity system SHALL still track the dependency on the underlying ref.

#### Scenario: Computed tracks ref through Proxy
- **WHEN** a computed property reads `$state.count` (which goes through the Proxy)
- **THEN** the computed property re-evaluates when `state.count` changes

#### Scenario: Watch tracks ref through Proxy
- **WHEN** a watcher observes `state.count` (through the Proxy)
- **THEN** the watcher triggers when `state.count` changes

### Requirement: State Proxy handles all state types

The system SHALL create the Proxy to correctly handle all Vue 3 state types: `ref`, `reactive`, `shallowRef`, `shallowReactive`, `readonly`, `toRef`, and `toRefs`.

#### Scenario: Handle shallowRef
- **WHEN** state contains `data: shallowRef({ nested: true })` and code accesses `state.data`
- **THEN** the Proxy returns the shallow ref's `.value` without deep reactivity

#### Scenario: Handle readonly
- **WHEN** state contains `config: readonly(reactive({ key: 'value' }))` and code accesses `state.config`
- **THEN** the Proxy returns the readonly object directly

### Requirement: State Proxy integrated into render context

The system SHALL provide the State Proxy as the `state` property in the RenderContext, replacing the raw state object. All expression evaluation and function execution SHALL use the Proxy-backed state.

#### Scenario: Expression uses Proxy state
- **WHEN** an expression `$state.count > 0` is evaluated
- **THEN** the expression accesses state through the Proxy

#### Scenario: Function body uses Proxy state
- **WHEN** a function body `$state.count++` is executed
- **THEN** the function modifies state through the Proxy

## MODIFIED Requirements

### Requirement: Expression evaluation no longer needs .value handling
**From** (in `openspec/specs/reactive-system/spec.md`):
When expressions use `state.count.value`, the system accesses the ref's `.value` property directly.

**To**:
When expressions use `$state.count`, the system accesses state through the Proxy which auto-unwraps `.value`. Explicit `.value` references are no longer needed or supported.

#### Scenario: Expression without .value
- **WHEN** expression is `$state.count > 0`
- **THEN** the system evaluates correctly without requiring `.value`

## REMOVED Requirements

### Requirement: Explicit .value access in expressions
**Reason**: State Proxy handles .value automatically
**Migration**: Remove all `.value` suffixes from state/computed references in expressions and function bodies

### Requirement: stateType map for .value insertion
**Reason**: State Proxy eliminates the need to distinguish ref vs reactive at transformation time
**Migration**: Remove stateTypes map from evaluateStringExpression and transformFunctionBody
