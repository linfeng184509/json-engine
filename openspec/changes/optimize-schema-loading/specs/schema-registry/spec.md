## ADDED Requirements

### Requirement: Registry loads schemas via Vite glob imports
The schema registry SHALL use Vite's `import.meta.glob` to collect and lazy-load all JSON schema files from the `./schemas/` directory at build time.

#### Scenario: Glob import collects all schemas
- **WHEN** the registry module is initialized
- **THEN** all JSON files matching `./schemas/**/*.json` are registered as lazy-importable modules

#### Scenario: Lazy loading with code splitting
- **WHEN** a schema path is requested via `loadSchema(path)`
- **THEN** the registry dynamically imports only that specific schema file
- **AND** Vite creates a separate chunk for the imported schema

### Requirement: Registry provides schema existence check
The registry SHALL provide a `hasSchema(path)` function to check if a schema path is registered.

#### Scenario: Check registered schema
- **WHEN** `hasSchema('./schemas/demos/button/basic.json')` is called for a registered path
- **THEN** the function returns `true`

#### Scenario: Check unregistered schema
- **WHEN** `hasSchema('./schemas/nonexistent.json')` is called for an unregistered path
- **THEN** the function returns `false`

### Requirement: Registry caches loaded schemas
The registry SHALL cache both the parsed schema object and its JSON text representation after first load.

#### Scenario: Cache schema on first load
- **WHEN** `loadSchema(path)` is called for the first time
- **THEN** the schema is imported, parsed, and stored in cache
- **AND** the JSON text is generated and stored alongside

#### Scenario: Return cached schema on subsequent loads
- **WHEN** `loadSchema(path)` is called for a cached path
- **THEN** the cached schema is returned immediately without re-importing

### Requirement: Registry provides cached JSON text
The registry SHALL provide a `getCachedJsonText(path)` function to retrieve the JSON text representation of a cached schema.

#### Scenario: Get cached JSON text
- **WHEN** `getCachedJsonText(path)` is called for a cached schema
- **THEN** the formatted JSON text (with 2-space indentation) is returned

#### Scenario: Get text for uncached schema
- **WHEN** `getCachedJsonText(path)` is called for an uncached schema
- **THEN** `null` is returned

### Requirement: Registry path format matches glob keys
The registry SHALL use relative paths starting with `./schemas/` that directly match `import.meta.glob` keys.

#### Scenario: Path format consistency
- **WHEN** a path `./schemas/demos/button/basic.json` is provided
- **THEN** it directly matches the glob key without any path transformation
- **AND** the loader function is retrieved from `schemaModules[path]`