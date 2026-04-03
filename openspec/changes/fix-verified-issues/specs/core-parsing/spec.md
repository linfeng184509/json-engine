## MODIFIED Requirements

### Requirement: $ref without dot SHALL produce warning or error
When a `$ref` value does not contain a dot separator (e.g., `{ $ref: 'count' }`), the parser SHALL NOT silently return the original value. It SHALL either call `config.onError` with a descriptive error or emit a warning in debug mode.

#### Scenario: $ref without dot triggers error handler
- **WHEN** `parseJson` encounters `{ $ref: 'count' }` (no dot) and `config.onError` is provided
- **THEN** `config.onError` is called with a message indicating the $ref format is invalid

#### Scenario: $ref without dot logs warning in debug mode
- **WHEN** `parseJson` encounters `{ $ref: 'count' }` (no dot) and debug is enabled
- **THEN** a warning is logged indicating the $ref format is invalid

#### Scenario: valid $ref with dot parses normally
- **WHEN** `parseJson` encounters `{ $ref: 'state.count' }`
- **THEN** the reference is parsed normally without any warning or error
