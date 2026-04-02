## ADDED Requirements

### Requirement: $ref value type for state/props/computed references

The system SHALL support the `$ref` value type for referencing state, props, or computed properties. The `$ref` value is a string in the format `"<prefix>.<variable>[.<path>...]"` where prefix is one of `state`, `props`, or `computed`.

#### Scenario: Reference state variable
- **WHEN** a prop value is `{ "$ref": "state.count" }`
- **THEN** the system resolves it to the current value of `state.count`

#### Scenario: Reference props variable
- **WHEN** a prop value is `{ "$ref": "props.title" }`
- **THEN** the system resolves it to the current value of `props.title`

#### Scenario: Reference computed variable
- **WHEN** a prop value is `{ "$ref": "computed.fullName" }`
- **THEN** the system resolves it to the current value of `computed.fullName`

#### Scenario: Reference nested path
- **WHEN** a prop value is `{ "$ref": "state.user.profile.email" }`
- **THEN** the system resolves it to `state.user.profile.email` using nested property access

### Requirement: $expr value type for expressions

The system SHALL support the `$expr` value type for JavaScript expressions that evaluate to a value. The `$expr` value is a string containing a JavaScript expression.

#### Scenario: Simple comparison expression
- **WHEN** a prop value is `{ "$expr": "state.count > 0" }`
- **THEN** the system evaluates the expression and returns the boolean result

#### Scenario: Ternary expression
- **WHEN** a prop value is `{ "$expr": "state.count > 5 ? 'many' : 'few'" }`
- **THEN** the system evaluates the ternary and returns the string result

#### Scenario: Expression referencing state
- **WHEN** a prop value is `{ "$expr": "state.firstName + ' ' + state.lastName" }`
- **THEN** the system evaluates string concatenation and returns the combined name

### Requirement: $fn value type for functions

The system SHALL support the `$fn` value type for function definitions. When `$fn` is a string, it represents a function body with no parameters. When `$fn` is an object, it MAY contain `params` (string array) and `body` (string) fields.

#### Scenario: Simple function body string
- **WHEN** a prop value is `{ "$fn": "methods.handleClick()" }`
- **THEN** the system creates a callable function that executes `methods.handleClick()`

#### Scenario: Function with params
- **WHEN** a prop value is `{ "$fn": { "params": ["e"], "body": "$state.value = e.target.value" } }`
- **THEN** the system creates a callable function with parameter `e` that executes the body

#### Scenario: Empty params omitted
- **WHEN** a `$fn` value is a string (not an object)
- **THEN** the system creates a function with no named parameters (uses `args` array if needed)

### Requirement: $scope value type for service injection

The system SHALL support the `$scope` value type for referencing injected services. The `$scope` value is a string in the format `"<namespace>.<service>[.<method>...]"` where namespace is one of `core` or `ui`.

#### Scenario: Reference core API service
- **WHEN** a function body contains `$core.api.get('/users')`
- **THEN** the system resolves `$core.api` to the registered API service

#### Scenario: Reference core router service
- **WHEN** a function body contains `$core.router.push('/dashboard')`
- **THEN** the system resolves `$core.router` to the registered router service

#### Scenario: Reference UI antd service
- **WHEN** a function body contains `$ui.antd.message.success('ok')`
- **THEN** the system resolves `$ui.antd` to the registered Ant Design service

### Requirement: Native values used directly without wrapping

The system SHALL allow native JSON values (strings, numbers, booleans, objects, arrays, null) to be used directly in any value position without wrapping in a type indicator.

#### Scenario: String value
- **WHEN** a prop value is `"container"`
- **THEN** the system uses the string directly without transformation

#### Scenario: Object value
- **WHEN** a prop value is `{ "grid": { "gutter": 16 } }`
- **THEN** the system uses the object directly without transformation

#### Scenario: Boolean value
- **WHEN** a prop value is `true`
- **THEN** the system uses the boolean directly without transformation

### Requirement: Backward incompatible format

The system SHALL NOT support the legacy `{ type: 'xxx', body: '{{...}}' }` format. All schemas MUST use the new `$ref`/`$expr`/`$fn`/`$scope` format.

#### Scenario: Legacy format rejected
- **WHEN** input contains `{ "type": "expression", "body": "{{state.count}}" }`
- **THEN** the system throws a ParseError indicating the format is no longer supported

## REMOVED Requirements

### Requirement: ValueConstraintParser (string type)
**Reason**: Native JSON strings replace `{ type: 'string', body: "'value'" }` format
**Migration**: Replace `"body": "'value'"` with the raw string `value`

### Requirement: ValueObjectParser (object type)
**Reason**: Native JSON objects replace `{ type: 'object', body: '{{{...}}}' }` format
**Migration**: Replace `"body": "{{{ key: value }}}"` with the raw object `{ "key": value }`

### Requirement: Triple-brace function params format
**Reason**: Function params use simple string arrays instead of `{{{param1, param2}}}` format
**Migration**: Replace `"params": "{{{info}}}"` with `"params": ["info"]`
