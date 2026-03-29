# Tasks - Permission Mechanism Framework

## Overview

实现企业级应用引擎的权限机制框架和多终端适配能力。

## Phase 1: Core Types & Platform Detection

### 1.1 Platform Detector
**Spec:** `specs/platform-detector/spec.md`

- [ ] Create `src/packages/vue-json/src/types/platform.ts`
  - Define `Platform` type: `'pc-browser' | 'pc-client' | 'pda' | 'pad'`
  - Define `PlatformFeatures` type
  - Define `PlatformInfo` interface with `platform`, `features`, `userAgent`, `screenWidth`, `touchPoints`
- [ ] Create `src/packages/vue-json/src/runtime/platform-detector.ts`
  - Implement `detect(): PlatformInfo` auto-detection logic
  - PC browser: Mozilla userAgent + width > 768px + touchPoints === 0
  - PC client: `window.electron` exists
  - PDA: width < 480px + touchPoints > 0
  - PAD: width 481-1024px + touchPoints > 0
- [ ] Export `detect`, `getPlatform` from index

### 1.2 Auth Types
**Spec:** `specs/permission-provider/spec.md`, `specs/permission-checker/spec.md`

- [ ] Create `src/packages/vue-json/src/types/auth.ts`
  - Define `FieldPermission` interface: `{ read, write, hidden, privacy }`
  - Define `SOPStepPermission` interface: `{ canExecute, canView, availableFields }`
  - Define `PermissionProvider` interface with all methods
  - Define `PermissionChecker` interface with `has`, `hasAny`, `hasAll`, `hasRole`, `isPlatform`, `canAccessPage`

## Phase 2: Permission Provider & Checker

### 2.1 PermissionProvider Implementation
**Spec:** `specs/permission-provider/spec.md`

- [ ] Create `src/packages/vue-json/src/runtime/permission-provider.ts`
  - Implement `DefaultPermissionProvider` class (returns empty/deny-all)
  - Implement `registerPermissionProvider(provider)` function
  - Implement `getPermissionProvider()` singleton getter
- [ ] Create `src/packages/vue-json/src/runtime/permission-checker.ts`
  - Implement `PermissionCheckerImpl` class using Provider
  - Implement all `has*` methods
  - Implement `isPlatform` method
  - Implement `canAccessPage` method with page→permission mapping
- [ ] Export from `src/packages/vue-json/src/index.ts`

### 2.2 Field Permission
**Spec:** `specs/field-permission/spec.md`

- [ ] Create `src/packages/vue-json/src/runtime/field-permission.ts`
  - Implement `getFieldPermission(page, field): FieldPermission`
  - Implement `canReadField(page, field): boolean`
  - Implement `canWriteField(page, field): boolean`
  - Implement `isFieldHidden(page, field): boolean`
  - Implement `isFieldPrivate(page, field): boolean`

### 2.3 Data Filter
**Spec:** `specs/data-filter/spec.md`

- [ ] Create `src/packages/vue-json/src/runtime/data-filter.ts`
  - Implement `filterData(data, fields, permissions): object`
  - Implement `applyPrivacyMask(value, privacyType): string`
  - Support privacy types: `name`, `phone`, `idcard`, `email`, `custom`
  - Implement `maskName`, `maskPhone`, `maskIdCard`, `maskEmail` utilities

### 2.4 SOP Permission
**Spec:** `specs/sop-permission/spec.md`

- [ ] Create `src/packages/vue-json/src/types/sop.ts`
  - Define `SOPStep` interface: `{ id, name, permissions, availableFields, nextSteps }`
  - Define `SOPConfig` interface: `{ id, name, steps, initialStep }`
- [ ] Create `src/packages/vue-json/src/runtime/sop-permission.ts`
  - Implement `getSOPStepPermission(sop, step): SOPStepPermission`
  - Implement `canExecuteSOPtep(sop, step): boolean`
  - Implement `canViewSOPStep(sop, step): boolean`
  - Implement `getAvailableFields(sop, step): string[]`

## Phase 3: App Schema & Factory

### 3.1 App Schema Types
**Spec:** `specs/app-schema/spec.md`

- [ ] Create `src/packages/vue-json/src/types/app.ts`
  - Define `VueJsonAppSchema` interface
  - Define `PluginConfig` interface
  - Define `UIConfig` interface
  - Define `NetworkConfig` interface
  - Define `StorageConfig` interface
  - Define `I18nConfig` interface
  - Define `AuthConfig` interface

### 3.2 App Factory
**Spec:** `specs/app-schema/spec.md`

- [ ] Create `src/packages/vue-json/src/runtime/app-factory.ts`
  - Implement `loadSchema(source: string | object): Promise<VueJsonAppSchema>`
  - Implement `validateSchema(schema): boolean` throws `SchemaValidationError`
  - Implement `cacheSchema(url, schema)` with TTL
  - Support multi-file references (import/require resolution)

### 3.3 Router Factory
**Spec:** `specs/router-factory/spec.md`

- [ ] Create `src/packages/vue-json/src/types/router.ts`
  - Define `RouteConfig` interface
  - Define `RouterConfig` interface
- [ ] Create `src/packages/vue-json/src/runtime/router-factory.ts`
  - Implement `createRouter(config): Router`
  - Implement `registerRoutes(routes)` dynamic registration
  - Implement `addRouteGuard(guard)` navigation guards

### 3.4 Store Factory
**Spec:** `specs/store-factory/spec.md`

- [ ] Create `src/packages/vue-json/src/types/store.ts`
  - Define `StoreModuleConfig` interface
  - Define `StoreConfig` interface
- [ ] Create `src/packages/vue-json/src/runtime/store-factory.ts`
  - Implement `createStore(config): Store`
  - Implement `registerModule(name, module)`
  - Implement `getModule(name): Module`

## Phase 4: UI, Network, Storage, I18n Factories

### 4.1 UI Integration
**Spec:** `specs/ui-integration/spec.md`

- [ ] Create `src/packages/vue-json/src/types/ui.ts`
  - Define `UIComponentLibrary` interface
  - Define `ThemeConfig` interface
- [ ] Create `src/packages/vue-json/src/runtime/ui-factory.ts`
  - Implement `registerComponents(components)` global registration
  - Implement `configureTheme(theme)` theme configuration
  - Implement `getComponent(name): Component`

### 4.2 Network Factory
**Spec:** `specs/network-factory/spec.md`

- [ ] Create `src/packages/vue-json/src/types/network.ts`
  - Define `AxiosConfig` interface
  - Define `WSConfig` interface
  - Define `WSMessageHandler` type
- [ ] Create `src/packages/vue-json/src/runtime/network-factory.ts`
  - Implement `createAxiosInstance(config): AxiosInstance`
  - Implement `configInterceptors(instance)` request/response interceptors
  - Implement `configRetry(instance, retryConfig)` retry logic
  - Implement `createWSConnection(config): WebSocket` with auto-reconnect
  - Implement `subscribeWSChannel(channel, handler)` topic subscription
  - Implement `bindWSToState(ws, state, path)` auto state update

### 4.3 Storage Factory
**Spec:** `specs/storage-factory/spec.md`

- [ ] Create `src/packages/vue-json/src/types/storage.ts`
  - Define `StorageConfig` interface
  - Define `EncryptionConfig` interface
- [ ] Create `src/packages/vue-json/src/runtime/storage-factory.ts`
  - Implement `createStorageAdapter(config): StorageAdapter`
  - Implement `syncToStorage(key, value)` persistence
  - Implement `syncFromStorage(key): value` retrieval
  - Implement `enableEncryption(config)` AES encryption
  - Implement `clearStorage()` method

### 4.4 I18n Factory
**Spec:** `specs/i18n-factory/spec.md`

- [ ] Create `src/packages/vue-json/src/types/i18n.ts`
  - Define `I18nConfig` interface
  - Define `MessageSchema` type
- [ ] Create `src/packages/vue-json/src/runtime/i18n-factory.ts`
  - Implement `createI18n(config): I18n`
  - Implement `loadLocaleMessages(locale, messages)`
  - Implement `setLocale(locale)` with reactive update
  - Implement `t(key, params?)` translation function

## Phase 5: Multi-Platform Config

### 5.1 Multi-Platform Config
**Spec:** `specs/multi-platform-config/spec.md`

- [ ] Create `src/packages/vue-json/src/runtime/multi-platform-config.ts`
  - Implement `getPlatformConfig<T>(config, platform): T` platform-specific retrieval
  - Implement `filterMenuByPlatform(menu, platform)` menu filtering
  - Implement `filterPagesByPlatform(pages, platform)` page filtering

## Phase 6: Auth Directive & Core Scope Integration

### 6.1 Auth Directive
**Spec:** `specs/auth-directive/spec.md`

- [ ] Create `src/packages/vue-json/src/types/directive.ts`
  - Define `AuthDirectiveConfig` interface
- [ ] Create `src/packages/vue-json/src/runtime/auth-directive.ts`
  - Implement `v-auth` directive: `has(permission)` visibility control
  - Implement `v-auth-any` directive: `hasAny(permissions)` any-match visibility
  - Implement `v-auth-all` directive: `hasAll(permissions)` all-match visibility
  - Implement `v-auth-role` directive: `hasRole(role)` role-based visibility

### 6.2 Reactive System Extension
**Spec:** `specs/reactive-system-ext/spec.md`

- [ ] Extend `src/packages/core-engine/src/types.ts`
  - Add `CoreScopeAuth` interface: `_auth.has`, `_auth.hasAny`, `_auth.hasAll`, `_auth.hasRole`
  - Add `CoreScopeApi` interface: `_api.get`, `_api.post`, `_api.put`, `_api.delete`, `_api.ws`
  - Add `CoreScopeStorage` interface: `_storage.get`, `_storage.set`, `_storage.remove`
  - Add `CoreScopeI18n` interface: `_i18n.t`, `_i18n.locale`
- [ ] Integrate permission checker into Core Scope evaluation context

## Phase 7: Parser Updates

### 7.1 JSON Schema Parser Extension
**Spec:** `proposal.md`

- [ ] Update `src/packages/vue-json/src/parser/index.ts`
  - Add `import` keyword support for schema references
  - Add `$import` syntax: `{ "$import": "./components/Button.json" }`
  - Add `directives` field parsing in schema nodes
- [ ] Add permission field parsing to schema validator

## Phase 8: Testing

### 8.1 Unit Tests
- [ ] Write `src/packages/vue-json/src/runtime/platform-detector.test.ts`
- [ ] Write `src/packages/vue-json/src/runtime/permission-provider.test.ts`
- [ ] Write `src/packages/vue-json/src/runtime/permission-checker.test.ts`
- [ ] Write `src/packages/vue-json/src/runtime/field-permission.test.ts`
- [ ] Write `src/packages/vue-json/src/runtime/data-filter.test.ts`
- [ ] Write `src/packages/vue-json/src/runtime/sop-permission.test.ts`

### 8.2 Integration Tests
- [ ] Write `src/packages/vue-json/src/__tests__/app-factory.test.ts`
- [ ] Write `src/packages/vue-json/src/__tests__/auth-directive.test.ts`
- [ ] Write `src/packages/vue-json/src/__tests__/multi-platform.test.ts`

## Dependencies

```
Phase 1 (Platform + Types)
  └─ Phase 2 (Permission)
       ├─ Field Permission
       ├─ Data Filter
       └─ SOP Permission
            └─ Phase 3 (Factories)
                 ├─ App Factory
                 ├─ Router Factory
                 └─ Store Factory
                      └─ Phase 4 (UI/Network/Storage/I18n)
                           └─ Phase 5 (Multi-Platform)
                                └─ Phase 6 (Auth Directive + Core Scope)
                                     └─ Phase 7 (Parser)
                                          └─ Phase 8 (Tests)
```

## Priority Order

1. **platform-detector** - No dependencies
2. **permission-provider** - No dependencies
3. **permission-checker** - Depends on provider
4. **field-permission** - Depends on provider
5. **data-filter** - Depends on field-permission
6. **sop-permission** - Depends on provider
7. **app-schema/types** - No dependencies
8. **app-factory** - Depends on types, platform-detector
9. **router-factory** - Depends on types
10. **store-factory** - Depends on types
11. **ui-integration** - No dependencies
12. **network-factory** - No dependencies
13. **storage-factory** - No dependencies
14. **i18n-factory** - No dependencies
15. **multi-platform-config** - Depends on platform-detector
16. **auth-directive** - Depends on permission-checker
17. **reactive-system-ext** - Depends on all factories
18. **parser-updates** - Depends on types
19. **testing** - Depends on implementation