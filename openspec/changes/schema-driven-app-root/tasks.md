## 1. Schema Loader Core Implementation

- [x] 1.1 Create `vue-json/runtime/schema-loader.ts` with `SchemaLoader` class
- [x] 1.2 Implement `load(path, options)` method with fetch + cache + validate
- [x] 1.3 Implement `clearCache()` method to clear all cached schemas
- [x] 1.4 Implement `preload(paths)` method for parallel schema loading
- [x] 1.5 Add `SchemaLoadResult` type: `{ success, component?, error? }`
- [x] 1.6 Export schema-loader APIs from `vue-json/src/index.ts`

## 2. CoreScope Extension

- [x] 2.1 Extend `CoreScope` interface with `_loader` property
- [x] 2.2 Extend `CoreScope` interface with `_router` property
- [x] 2.3 Implement `_loader` in `createCoreScope()` with schema-loader instance
- [x] 2.4 Implement `_router` in `createCoreScope()` with `push`, `replace`, `currentRoute`
- [x] 2.5 Update `CoreScopeAuth`, `CoreScopeLoader`, `CoreScopeRouter` type exports

## 3. PageLoader Component

- [x] 3.1 Create `vue-json/components/PageLoader.vue` SFC
- [x] 3.2 Implement props: `schemaPath`, `cache`, `extraComponents`, `loadingSlot`, `errorSlot`
- [x] 3.3 Implement loading state with default spinner
- [x] 3.4 Implement error state with default error UI
- [x] 3.5 Implement `loadSchema()` internal method using schema-loader
- [x] 3.6 Implement `retry()` exposed method for error recovery
- [x] 3.7 Add slots for custom loading and error UI
- [x] 3.8 Register PageLoader as built-in component in component-factory

## 4. Component Factory Extension

- [x] 4.1 Modify `createComponent` to auto-register PageLoader
- [x] 4.2 Add `loader` option to `CreateComponentOptions`
- [x] 4.3 Ensure PageLoader is available without extraComponents
- [x] 4.4 Allow custom PageLoader override via extraComponents

## 5. App Root Schema Creation

- [x] 5.1 Create `enterprise-admin/public/schemas/app-root.json`
- [x] 5.2 Define state: `isInitializing`, `isLoading`, `error`, `appConfig`, `currentRoute`, `pageSchemaPath`
- [x] 5.3 Implement `initializeApp` method: load app.json, setup providers
- [x] 5.4 Implement `loadPage` method: match route, check auth, set pageSchemaPath
- [x] 5.5 Implement `handleHashChange` method: update currentRoute, call loadPage
- [x] 5.6 Define lifecycle: `onMounted` for init + hash listener, `onUnmounted` for cleanup
- [x] 5.7 Define render: conditional v-if for init/loading/error/page states
- [x] 5.8 Use PageLoader in render to display loaded page schema

## 6. App.vue Simplification

- [x] 6.1 Remove manual state management from App.vue
- [x] 6.2 Remove route handling logic from App.vue
- [x] 6.3 Remove page loading logic from App.vue
- [x] 6.4 Simplify App.vue to single `createComponent(appRootSchema)` call
- [x] 6.5 Keep minimal bootstrap: import styles, load app-root schema, render component

## 7. Testing

- [x] 7.1 Add unit tests for schema-loader `load()` method
- [x] 7.2 Add unit tests for schema-loader cache behavior
- [x] 7.3 Add unit tests for CoreScope `_loader` API
- [x] 7.4 Add unit tests for CoreScope `_router` API
- [x] 7.5 Add component tests for PageLoader
- [x] 7.6 Add integration test for app-root.json schema
- [x] 7.7 Add E2E test for full schema-driven app flow