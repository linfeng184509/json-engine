## ADDED Requirements

### Requirement: Initial expression state context
The system SHALL pass the correct state context when evaluating expressions in initial state values.

#### Scenario: State reference in initial expression
- **WHEN** a state definition has an initial value with expression referencing another state variable
- **THEN** the expression SHALL be evaluated with access to the existing state variables

#### Scenario: Expression referencing props
- **WHEN** initial value expression references `$props.someValue`
- **THEN** the expression SHALL be evaluated with props context available

#### Scenario: Expression with no state dependencies
- **WHEN** initial value is an expression like `{ $expr: "1 + 1" }`
- **THEN** the expression SHALL evaluate to `2`

#### Scenario: Reference to yet-to-be-created state
- **WHEN** initial expression references a state variable defined later in the schema
- **THEN** the system SHALL handle this gracefully (undefined or error)
