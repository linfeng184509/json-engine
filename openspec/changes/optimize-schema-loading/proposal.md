## Why

The `antd-demo-playground` project loads the same JSON schema file twice on every page navigation: once via `fetch()` in `loadPage` method to display JSON code, and again via `PageLoader` component to render the Vue component. This results in redundant network requests and wasted bandwidth in production deployments.

## What Changes

- Migrate JSON schemas from `public/schemas/` to `src/schemas/` directory
- Create `schema-registry.ts` using Vite's `import.meta.glob` for compile-time JSON imports
- Extend `SchemaLoader` with `setRegistryLoader` API to support local schema loading
- Modify `loadPage` method to use cached JSON text from registry instead of fetching
- All JSON schemas will be bundled into JS modules for zero network requests at runtime

## Capabilities

### New Capabilities

- `schema-registry`: Central registry for loading and caching JSON schemas at build time using Vite glob imports. Provides `loadSchema()`, `hasSchema()`, and `getCachedJsonText()` APIs.

### Modified Capabilities

- `schema-loader`: Extended to support local schema registry injection via `setRegistryLoader()` method. Detects local schema paths and routes loading through registry instead of fetch.

## Impact

- **vue-json package**: `SchemaLoaderImpl` class extended with new `setRegistryLoader` method
- **antd-demo-playground**: 
  - New file `src/schema-registry.ts`
  - Modified `src/setup-app.ts` to inject registry and extend coreScope
  - Directory migration `public/schemas/` → `src/schemas/`
  - Updated `src/schemas/app.json` path format from `/json-engine/schemas/...` to `./schemas/...`
  - Updated `src/schemas/app-root.json` `loadPage` method to use `coreScope.getCachedJsonText`
- **Build**: JSON files compiled into JS bundles, slight bundle size increase but eliminated runtime fetch overhead
- **Development**: Vite HMR continues to work for JSON file modifications (existing files auto-refresh, new files require dev server restart)