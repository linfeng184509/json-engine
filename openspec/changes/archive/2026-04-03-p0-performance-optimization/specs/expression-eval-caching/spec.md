## ADDED Requirements

### Requirement: Function compilation caching
The system SHALL cache compiled `Function` instances produced by `evaluateStringExpression()`, keyed by the transformed expression string, to avoid redundant `new Function()` calls for identical expressions.

#### Scenario: Cache hit on repeated expression
- **WHEN** `evaluateStringExpression()` is called twice with the same expression string (e.g., `$state.count > 0`)
- **THEN** the second call retrieves the cached `Function` instance instead of creating a new one via `new Function()`

#### Scenario: Cache miss on first expression
- **WHEN** `evaluateStringExpression()` is called with an expression not previously seen
- **THEN** a new `Function` is created, stored in the cache, and executed

#### Scenario: Transformed string as cache key
- **WHEN** `evaluateStringExpression()` is called with `$state.count` and later with `state.count`
- **THEN** both calls produce the same transformed string and the second call hits the cache

#### Scenario: Cache respects LRU eviction
- **WHEN** the number of unique cached expressions exceeds the cache maxSize (1000)
- **THEN** the least recently used entries are evicted to make room for new entries

#### Scenario: Cache does not affect evaluation result
- **WHEN** an expression is evaluated using a cached `Function` versus a freshly created one
- **THEN** both produce identical results given the same context
