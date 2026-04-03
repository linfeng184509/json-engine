## ADDED Requirements

### Requirement: validateFunctionValue SHALL be a shared utility
The `validateFunctionValue` function SHALL be defined once in a shared utility module and imported by all parser modules that need it, eliminating code duplication.

#### Scenario: Single source of truth
- **WHEN** any parser module needs to validate a function value
- **THEN** it imports `validateFunctionValue` from the shared utility module

#### Scenario: No duplicate definitions
- **WHEN** searching the codebase for `validateFunctionValue` definitions
- **THEN** only one definition exists in the shared utility module

### Requirement: Node.js-specific code SHALL NOT execute in browser
Functions that depend on Node.js built-in modules (fs, path) SHALL be clearly marked and SHALL NOT be included in browser bundles, or SHALL provide graceful degradation when executed in browser environments.

#### Scenario: writeTypeDefinition in browser
- **WHEN** `writeTypeDefinition` is called in a browser environment
- **THEN** a clear error is thrown indicating this function requires Node.js

#### Scenario: checkPeerDependencies in browser
- **WHEN** `checkPeerDependencies` is called in a browser environment
- **THEN** it gracefully handles the absence of `require.resolve`
