## ADDED Requirements

### Requirement: parseJson SHALL use cache option when provided
When a `cache` option is provided in `ParserOptions`, the `parseJson` function SHALL check the cache before parsing each value and store results after parsing.

#### Scenario: Cache hit returns cached result
- **WHEN** `parseJson` is called with a cache that contains a result for a given path
- **THEN** the cached result is returned without re-parsing

#### Scenario: Cache miss parses and stores result
- **WHEN** `parseJson` is called with a cache that does not contain a result for a given path
- **THEN** the value is parsed and the result is stored in the cache

#### Scenario: Cache disabled skips all cache operations
- **WHEN** `cache.enabled` is `false`
- **THEN** no cache lookups or stores are performed

#### Scenario: Cache key is derived from path and value
- **WHEN** a value is processed at a given path
- **THEN** the cache key is computed from the path and a hash of the value
