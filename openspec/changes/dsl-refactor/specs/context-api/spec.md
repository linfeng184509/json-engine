## ADDED Requirements

### Requirement: $state context variable in function bodies

The system SHALL provide `$state` as a context variable in function bodies that maps to the state proxy. All references to `$state.<variable>` SHALL be transformed to `state.<variable>` at runtime, with the Proxy handling automatic `.value` unwrapping for ref types.

#### Scenario: Read state variable
- **WHEN** a function body contains `$state.count`
- **THEN** the system transforms it to `state.count` and the Proxy returns the ref's `.value`

#### Scenario: Write state variable
- **WHEN** a function body contains `$state.count = 5`
- **THEN** the system transforms it to `state.count = 5` and the Proxy sets the ref's `.value`

#### Scenario: Access nested state path
- **WHEN** a function body contains `$state.user.name`
- **THEN** the system transforms it to `state.user.name` with nested property access

#### Scenario: State increment shorthand
- **WHEN** a function body contains `$state.count++`
- **THEN** the system transforms it to `state.count++` and increments the ref's `.value`

### Requirement: $props context variable in function bodies

The system SHALL provide `$props` as a context variable in function bodies that maps directly to the props object. Props are read-only and do not require `.value` unwrapping.

#### Scenario: Read props variable
- **WHEN** a function body contains `$props.title`
- **THEN** the system transforms it to `props.title`

#### Scenario: Access nested props path
- **WHEN** a function body contains `$props.config.theme`
- **THEN** the system transforms it to `props.config.theme`

### Requirement: $computed context variable in function bodies

The system SHALL provide `$computed` as a context variable in function bodies that maps to the computed proxy. All references to `$computed.<variable>` SHALL be transformed to `computed.<variable>` at runtime, with the Proxy handling automatic `.value` unwrapping.

#### Scenario: Read computed variable
- **WHEN** a function body contains `$computed.fullName`
- **THEN** the system transforms it to `computed.fullName` and the Proxy returns the computed ref's `.value`

#### Scenario: Use computed in expression
- **WHEN** a function body contains `return $computed.total > 100 ? 'large' : 'small'`
- **THEN** the system evaluates the ternary with the computed value

### Requirement: $core namespace for framework services

The system SHALL provide `$core` as a namespace prefix for framework services in function bodies. The following services SHALL be available:

- `$core.api` → HTTP client (axios wrapper)
- `$core.router` → Router navigation
- `$core.storage` → LocalStorage/sessionStorage wrapper
- `$core.auth` → Authentication checks
- `$core.i18n` → Internationalization
- `$core.ws` → WebSocket connections

#### Scenario: Make API request
- **WHEN** a function body contains `$core.api.get('/users')`
- **THEN** the system transforms it to `coreScope._api.get('/users')`

#### Scenario: Navigate with router
- **WHEN** a function body contains `$core.router.push('/login')`
- **THEN** the system transforms it to `coreScope._router.push('/login')`

#### Scenario: Access storage
- **WHEN** a function body contains `$core.storage.get('token')`
- **THEN** the system transforms it to `coreScope._storage.get('token')`

### Requirement: $ui namespace for UI services

The system SHALL provide `$ui` as a namespace prefix for UI framework services in function bodies.

- `$ui.antd` → Ant Design Vue service (message, notification, modal)

#### Scenario: Show success message
- **WHEN** a function body contains `$ui.antd.message.success('ok')`
- **THEN** the system transforms it to `coreScope._antd.message.success('ok')`

#### Scenario: Show notification
- **WHEN** a function body contains `$ui.antd.notification.info({ message: 'info' })`
- **THEN** the system transforms it to `coreScope._antd.notification.info({ message: 'info' })`

### Requirement: $event shorthand for event argument

The system SHALL support `$event` as a shorthand for the first argument in event handler function bodies.

#### Scenario: Use $event in handler
- **WHEN** an event handler body contains `$event.target.value`
- **THEN** the system transforms it to `args[0].target.value`

### Requirement: methods reference unchanged

The system SHALL NOT transform `methods.xxx()` references in function bodies. Method calls SHALL remain as-is since `methods` is already available in the execution context.

#### Scenario: Call method from function body
- **WHEN** a function body contains `methods.loadRoleList()`
- **THEN** the system leaves it unchanged and calls the method

## MODIFIED Requirements

### Requirement: transformFunctionBody simplified regex replacement
**From** (in `openspec/specs/json-schema-parser/spec.md`):
The system uses complex regex patterns to transform `ref_state_xxx.value`, `ref_props_xxx`, `ref_computed_xxx.value`, `$_core_xxx`, and `$[core]_xxx` patterns with `.value` insertion logic based on stateType.

**To**:
The system uses simple regex replacement to transform `$state` → `state`, `$props` → `props`, `$computed` → `computed`, `$core.xxx` → `coreScope._xxx`, `$ui.antd` → `coreScope._antd`, and `$event` → `args[0]`. No `.value` insertion logic is needed due to State Proxy.

#### Scenario: Transform $state reference
- **WHEN** function body contains `$state.count`
- **THEN** the system replaces `$state` with `state`

#### Scenario: Transform $core.api reference
- **WHEN** function body contains `$core.api.get('/users')`
- **THEN** the system replaces `$core.api` with `coreScope._api`

#### Scenario: No .value insertion needed
- **WHEN** function body contains `$state.count = $state.count + 1`
- **THEN** the system transforms to `state.count = state.count + 1` without inserting `.value`

## REMOVED Requirements

### Requirement: ref_state_xxx string variable pattern
**Reason**: Replaced by `$state.xxx` context variable API
**Migration**: Replace all `ref_state_<var>` with `$state.<var>`, remove explicit `.value` references

### Requirement: ref_props_xxx string variable pattern
**Reason**: Replaced by `$props.xxx` context variable API
**Migration**: Replace all `ref_props_<var>` with `$props.<var>`

### Requirement: ref_computed_xxx string variable pattern
**Reason**: Replaced by `$computed.xxx` context variable API
**Migration**: Replace all `ref_computed_<var>` with `$computed.<var>`, remove explicit `.value` references

### Requirement: $_core_xxx and $[core]_xxx scope patterns
**Reason**: Replaced by unified `$core.xxx` namespace API
**Migration**: Replace `$_core_api` with `$core.api`, `$_core_router` with `$core.router`, etc.

### Requirement: $_antd scope pattern
**Reason**: Replaced by `$ui.antd` namespace API
**Migration**: Replace `$_antd.message` with `$ui.antd.message`, etc.

### Requirement: stateType-based .value insertion logic
**Reason**: State Proxy handles .value automatically, no need to track ref vs reactive types
**Migration**: Remove stateType map and conditional .value insertion from transformFunctionBody
