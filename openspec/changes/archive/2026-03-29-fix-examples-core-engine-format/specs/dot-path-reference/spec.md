## ADDED Requirements

### Requirement: Parser extracts variable and path from dot-notation references

The parser SHALL split dot-notation references into variable name and optional path components.

#### Scenario: Simple reference without path
- **WHEN** parsing `ref_state_count`
- **THEN** result SHALL be `{ variable: 'count', path: undefined }`

#### Scenario: Reference with single-level path
- **WHEN** parsing `ref_state_formData.name`
- **THEN** result SHALL be `{ variable: 'formData', path: 'name' }`

#### Scenario: Reference with multi-level path
- **WHEN** parsing `ref_state_user.profile.name`
- **THEN** result SHALL be `{ variable: 'user', path: 'profile.name' }`

#### Scenario: Props reference with path
- **WHEN** parsing `ref_props_user.name`
- **THEN** result SHALL be `{ variable: 'user', path: 'name' }`

### Requirement: Runtime resolves nested property values

The runtime SHALL resolve nested property values from state/props objects using the path component.

#### Scenario: Access nested property from ref object
- **WHEN** state contains `{ formData: ref({ name: 'John', email: 'john@example.com' }) }`
- **AND** evaluating `ref_state_formData.name`
- **THEN** result SHALL be `'John'`

#### Scenario: Access nested property from reactive object
- **WHEN** state contains `{ errors: reactive({ name: 'Required', email: '' }) }`
- **AND** evaluating `ref_state_errors.name`
- **THEN** result SHALL be `'Required'`

#### Scenario: Access undefined nested property
- **WHEN** state contains `{ user: ref(null) }`
- **AND** evaluating `ref_state_user.name`
- **THEN** result SHALL be `undefined`

### Requirement: StateRef and PropsRef types support optional path field

The StateRef and PropsRef type definitions SHALL include an optional `path` field for nested property access.

#### Scenario: StateRef with path
- **WHEN** a state reference is parsed from `ref_state_formData.name`
- **THEN** the StateRef object SHALL include `{ _type: 'state', variable: 'formData', path: 'name' }`

#### Scenario: PropsRef with path
- **WHEN** a props reference is parsed from `ref_props_user.name`
- **THEN** the PropsRef object SHALL include `{ _type: 'props', variable: 'user', path: 'name' }`