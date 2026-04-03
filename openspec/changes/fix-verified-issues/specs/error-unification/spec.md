## ADDED Requirements

### Requirement: parseValueByType SHALL handle errors consistently
All error handling in `parseValueByType` SHALL follow a single unified path: call `config.onError` if provided, otherwise throw a typed error.

#### Scenario: onError callback is invoked on parse failure
- **WHEN** a value fails to parse and `config.onError` is provided
- **THEN** `config.onError` is called with the path and error details

#### Scenario: Error is thrown when no onError callback
- **WHEN** a value fails to parse and `config.onError` is not provided
- **THEN** a typed error is thrown with the path and error details

#### Scenario: All parse branches use same error handler
- **WHEN** any parser branch fails (reference, scope, function, expression, string)
- **THEN** the same error handling logic is applied
