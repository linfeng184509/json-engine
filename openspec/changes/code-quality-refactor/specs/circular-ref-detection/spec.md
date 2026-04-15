## ADDED Requirements

### Requirement: Circular reference detection in walkJson
The system SHALL detect circular references during JSON traversal and throw a descriptive error to prevent stack overflow.

#### Scenario: Self-referencing object
- **WHEN** `parseJson` receives an object where `obj.self === obj`
- **THEN** the system SHALL throw an error with message containing "circular reference"

#### Scenario: Mutual reference
- **WHEN** `parseJson` receives `{ a: { b: null } }` where `a.b === a`
- **THEN** the system SHALL throw an error

#### Scenario: Array circular reference
- **WHEN** `parseJson` receives an array where `arr[0] === arr`
- **THEN** the system SHALL throw an error

#### Scenario: Normal JSON without circular reference
- **WHEN** `parseJson` receives valid JSON like `{ a: { b: 'value' } }`
- **THEN** parsing SHALL complete successfully without error

#### Scenario: JSON string input
- **WHEN** `parseJson` receives a JSON string (parsed internally via `JSON.parse`)
- **THEN** circular references SHALL be caught by `JSON.parse` itself
