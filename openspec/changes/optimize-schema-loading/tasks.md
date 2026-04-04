## 1. Vue-json Package - SchemaLoader Extension

- [x] 1.1 Add `registryLoader` private property to `SchemaLoaderImpl` class
- [x] 1.2 Implement `setRegistryLoader(loader: (path: string) => Promise<VueJsonSchemaInput>): void` method
- [x] 1.3 Implement `isLocalSchema(path: string): boolean` private method
- [x] 1.4 Modify `load()` method to check `isLocalSchema()` and use registry loader when available
- [x] 1.5 Implement `getCachedJsonText(path: string): string | null` method
- [x] 1.6 Export new methods in `src/runtime/index.ts`
- [x] 1.7 Run lint and typecheck for vue-json package

## 2. Antd-demo-playground - Schema Registry

- [x] 2.1 Create `src/schema-registry.ts` with `import.meta.glob` for `./schemas/**/*.json`
- [x] 2.2 Implement `hasSchema(path: string): boolean` function
- [x] 2.3 Implement `loadSchema(path: string): Promise<VueJsonSchemaInput>` function with caching
- [x] 2.4 Implement `getCachedJsonText(path: string): string | null` function
- [x] 2.5 Add TypeScript type imports for `VueJsonSchemaInput`

## 3. Antd-demo-playground - Setup Integration

- [x] 3.1 Import `getSchemaLoader` from `@json-engine/vue-json` in `setup-app.ts`
- [x] 3.2 Import registry functions from `./schema-registry`
- [x] 3.3 Call `schemaLoader.setRegistryLoader()` with registry `loadSchema` function
- [x] 3.4 Extend `coreScope` with `getCachedJsonText` property

## 4. Antd-demo-playground - Schema Migration

- [x] 4.1 Create `src/schemas/` directory
- [x] 4.2 Copy all files from `public/schemas/` to `src/schemas/`
- [x] 4.3 Update `src/schemas/app.json` route paths from `/json-engine/schemas/...` to `./schemas/...`
- [x] 4.4 Update `src/schemas/app-root.json` `loadPage` method to use `coreScope.getCachedJsonText` instead of fetch
- [x] 4.5 Remove `public/schemas/` directory

## 5. Verification

- [x] 5.1 Run `npm run lint` for antd-demo-playground
- [x] 5.2 Run `npm run typecheck` for antd-demo-playground
- [x] 5.3 Run `npm run build` for antd-demo-playground
- [ ] 5.4 Run `npm run dev` and verify page navigation works without duplicate network requests
- [ ] 5.5 Verify JSON code display shows correct content
- [ ] 5.6 Verify Vite HMR works when modifying existing JSON schemas