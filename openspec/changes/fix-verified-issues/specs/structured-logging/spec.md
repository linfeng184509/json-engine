## ADDED Requirements

### Requirement: Logger SHALL replace all console.log calls
A structured `Logger` utility SHALL be used instead of direct `console.log` calls throughout the codebase, with configurable log levels.

#### Scenario: Debug logs are suppressed in production
- **WHEN** log level is set to `warn` or higher
- **THEN** debug and info level logs are not output

#### Scenario: Error logs always output
- **WHEN** an error occurs
- **THEN** the error is logged regardless of log level setting

#### Scenario: Logger integrates with ParserConfig.debug
- **WHEN** `ParserConfig.debug.enabled` is true
- **THEN** the logger outputs at debug level
