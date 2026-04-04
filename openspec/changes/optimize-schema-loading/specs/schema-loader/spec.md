## ADDED Requirements

### Requirement: SchemaLoader accepts registry loader injection
The SchemaLoader SHALL provide a `setRegistryLoader(loader)` method to inject a custom schema loading function for local schemas.

#### Scenario: Inject registry loader
- **WHEN** `setRegistryLoader(async (path) => schema)` is called with a loader function
- **THEN** the loader is stored for use in subsequent `load()` calls

#### Scenario: Registry loader used for local paths
- **WHEN** `load('./schemas/demos/button/basic.json')` is called
- **AND** a registry loader has been set
- **THEN** the registry loader is invoked instead of fetch

### Requirement: SchemaLoader detects local schema paths
The SchemaLoader SHALL detect local schema paths by checking if the path starts with `./schemas/` and a registry loader is configured.

#### Scenario: Detect local schema
- **WHEN** path starts with `./schemas/`
- **AND** `registryLoader` is set
- **THEN** `isLocalSchema(path)` returns `true`

#### Scenario: Remote schema not detected as local
- **WHEN** path is a full URL like `https://example.com/schema.json`
- **THEN** `isLocalSchema(path)` returns `false`

#### Scenario: Local path without registry loader
- **WHEN** path starts with `./schemas/`
- **AND** `registryLoader` is NOT set
- **THEN** `isLocalSchema(path)` returns `false`
- **AND** fetch is used as fallback

### Requirement: SchemaLoader preserves fetch fallback
The SchemaLoader SHALL continue to use `fetch()` for remote schemas or when no registry loader is configured.

#### Scenario: Fetch remote schema
- **WHEN** `load('https://api.example.com/schema.json')` is called
- **THEN** the schema is fetched via HTTP

#### Scenario: Fetch local schema without registry
- **WHEN** `load('./schemas/demo.json')` is called
- **AND** no registry loader is set
- **THEN** the schema is fetched via HTTP (fallback behavior)

### Requirement: SchemaLoader caching works with registry
The SchemaLoader SHALL cache schemas loaded from registry the same way as fetch-loaded schemas.

#### Scenario: Cache registry-loaded schema
- **WHEN** a schema is loaded via registry loader with `cache: true`
- **THEN** the schema and component are cached in `schemaCache`
- **AND** subsequent calls return cached result

#### Scenario: Cache key is path string
- **WHEN** schema is cached
- **THEN** the cache key is the original path string (e.g., `./schemas/demo.json`)
- **AND** no path transformation occurs for cache lookup

### Requirement: SchemaLoader provides cached JSON text helper
The SchemaLoader SHALL provide a `getCachedJsonText(path)` method that returns JSON text from cache when available.

#### Scenario: Get cached JSON text
- **WHEN** `getCachedJsonText('./schemas/demo.json')` is called
- **AND** the schema is cached in SchemaLoader
- **THEN** formatted JSON text is returned

#### Scenario: No cached schema
- **WHEN** `getCachedJsonText(path)` is called for an uncached path
- **THEN** `null` is returned