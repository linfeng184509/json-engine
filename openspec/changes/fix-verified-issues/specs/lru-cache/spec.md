## ADDED Requirements

### Requirement: ParserCache SHALL implement true LRU eviction
The `ParserCache` SHALL evict the least recently used entries when the cache exceeds `maxSize`, not the oldest inserted entries.

#### Scenario: get() updates access order
- **WHEN** an entry is retrieved via `get()`
- **THEN** the entry's access timestamp is updated and it becomes the most recently used

#### Scenario: evictOldest removes least recently used entry
- **WHEN** the cache size exceeds `maxSize`
- **THEN** the entry that was accessed least recently is evicted

#### Scenario: evictExpired runs efficiently
- **WHEN** `set()` is called with TTL configured
- **THEN** expired entries are evicted without scanning the entire cache on every write
