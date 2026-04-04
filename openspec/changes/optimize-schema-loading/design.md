## Context

The `antd-demo-playground` package demonstrates Ant Design Vue components using JSON-driven schemas. Currently, the `app-root.json` schema's `loadPage` method fetches JSON via HTTP to display code, while `PageLoader` component independently loads the same JSON to render components. This architecture causes duplicate network requests per page view.

### Current Architecture Flow
```
Page Navigation
    ├── loadPage() → fetch(schemaPath) → JSON.text() → display code
    └── PageLoader → SchemaLoader.load() → fetch(schemaPath) → parse → render
                 ↓
              2 fetch calls for same file
```

### Constraints
- JSON schemas reside in `public/schemas/` (Vite copies to dist without compilation)
- `import.meta.glob` only works on `src/` directory files
- `coreScope` is available in `$fn` execution context
- `SchemaLoader` uses singleton pattern via `getSchemaLoader()`

## Goals / Non-Goals

**Goals:**
- Eliminate duplicate JSON loading (2 requests → 1 import)
- Bundle JSON schemas into JS modules for zero runtime fetch
- Maintain single unified cache for both schema and JSON text
- Preserve Vite HMR for JSON modifications during development

**Non-Goals:**
- No changes to remote schema loading (external URLs still use fetch)
- No modifications to other demo playground packages
- No breaking changes to public APIs in vue-json package

## Decisions

### Decision 1: Schema Location Migration
**Choice:** Move `public/schemas/` to `src/schemas/`

**Alternatives Considered:**
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| `public/schemas` + custom Vite plugin | Keep paths unchanged | Complex plugin, no glob support | ❌ Rejected |
| `src/schemas` + glob import | Native Vite support, code splitting | Path migration needed | ✅ Selected |
| Hybrid (dev/public, prod/src) | Best of both | Complex conditional logic | ❌ Rejected |

**Rationale:** `src/schemas` location enables `import.meta.glob('./schemas/**/*.json')` for lazy loading with code splitting. Vite handles HMR automatically for JSON files in src.

### Decision 2: Registry Architecture
**Choice:** Create standalone `schema-registry.ts` with glob imports and caching

**Alternatives Considered:**
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Extend SchemaLoader directly | Single cache location | Requires vue-json package API changes | ❌ Rejected |
| Separate registry + inject | Clean separation, app-level control | Two-tier caching | ✅ Selected |

**Rationale:** Separate registry allows app-level control without modifying vue-json's core API. Registry caches JSON text, SchemaLoader caches parsed components.

### Decision 3: SchemaLoader Extension API
**Choice:** Add `setRegistryLoader(fn)` method to SchemaLoaderImpl

**Alternatives Considered:**
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Constructor parameter | Explicit dependency | Breaks singleton pattern | ❌ Rejected |
| Optional method injection | Backward compatible, lazy setup | Slightly implicit | ✅ Selected |

**Rationale:** Method injection preserves backward compatibility. Apps that don't need registry continue using fetch. Apps inject registry at setup time.

### Decision 4: Path Format
**Choice:** Use relative paths `./schemas/...` in app.json

**Alternatives Considered:**
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| `/json-engine/schemas/...` (URL) | Familiar pattern | Requires URL→path mapping | ❌ Rejected |
| `./schemas/...` (relative) | Direct glob key match | Different from current | ✅ Selected |

**Rationale:** Relative path directly matches `import.meta.glob` keys (`./schemas/demos/...`), eliminating mapping logic.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Bundle size increase (JSON → JS) | Code splitting via lazy glob imports; only load visited pages |
| New JSON files require dev server restart | Document limitation; acceptable for infrequent additions |
| Two-tier caching (registry + SchemaLoader) | Registry cache is source; SchemaLoader references same schema object |
| Path migration affects all routes | Single file (`app.json`) centralizes all paths |
| `getCachedJsonText` not in CoreScope type | Use TypeScript `satisfies` + runtime extension; no breaking change |

## Migration Plan

### Phase 1: Core Infrastructure (vue-json package)
1. Add `setRegistryLoader` method to `SchemaLoaderImpl`
2. Add `isLocalSchema` detection logic
3. Add `getCachedJsonText` helper method

### Phase 2: Application Layer (antd-demo-playground)
1. Create `src/schema-registry.ts` with glob imports
2. Modify `src/setup-app.ts` to inject registry
3. Extend `coreScope` with `getCachedJsonText`
4. Migrate `public/schemas/` → `src/schemas/`

### Phase 3: Schema Updates
1. Update `app.json` routes to use `./schemas/...` paths
2. Update `app-root.json` `loadPage` to use `coreScope.getCachedJsonText`

### Rollback Strategy
- Remove `setRegistryLoader` call in setup-app.ts
- Restore `public/schemas/` directory
- Restore original `app.json` paths
- All changes are additive; removal restores original behavior