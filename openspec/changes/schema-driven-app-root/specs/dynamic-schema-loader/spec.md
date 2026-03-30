## ADDED Requirements

### Requirement: Dynamic schema loading from path
The system SHALL provide a `loadComponent(path, options)` API that fetches a JSON Schema from a URL, validates it, and creates a Vue component.

#### Scenario: Load component from valid schema path
- **WHEN** `loadComponent('/schemas/pages/dashboard.json', { cache: true })` is called
- **THEN** system fetches the schema, validates it, and returns a Vue component

#### Scenario: Handle invalid schema path
- **WHEN** `loadComponent('/schemas/invalid.json')` is called and fetch fails
- **THEN** system returns `{ success: false, error: Error }` without throwing

#### Scenario: Cache loaded schema
- **WHEN** `loadComponent(path, { cache: true })` is called twice with same path
- **THEN** second call uses cached schema without re-fetching

### Requirement: Schema loader API in CoreScope
The system SHALL expose a `_loader` API in CoreScope for use within Schema methods and expressions.

#### Scenario: Access loader from schema
- **WHEN** a schema method calls `scope._loader.load('/path/to/schema.json')`
- **THEN** the loader API returns the loaded component or error result

#### Scenario: Clear schema cache
- **WHEN** `scope._loader.clearCache()` is called
- **THEN** all cached schemas are removed from memory

### Requirement: Schema validation before component creation
The system SHALL validate the loaded schema using `parseSchema` before creating the component.

#### Scenario: Invalid schema rejected
- **WHEN** loaded schema fails validation
- **THEN** system returns `{ success: false, error: SchemaParseError }` with validation details

#### Scenario: Valid schema processed
- **WHEN** loaded schema passes validation
- **THEN** system creates component via `createComponent`