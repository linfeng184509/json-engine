## 1. Package Dependencies

- [ ] 1.1 Fix package.json dependencies: replace `@json-vue/*` with `@json-engine/*`
- [ ] 1.2 Verify all imports resolve correctly after dependency fix
- [ ] 1.3 Run typecheck to ensure no missing module errors

## 2. Types - DesignNode to VueJsonSchema Mapping

- [ ] 2.1 Create TypeMapping interface for DesignNode → VueJsonSchema conversion
- [ ] 2.2 Add helper types for core-engine expression values
- [ ] 2.3 Update VNodeDefinition usage to match vue-json types
- [ ] 2.4 Remove unused/non-existent type imports

## 3. schemaGenerator.ts - Core Refactoring

- [ ] 3.1 Rename `generateJsonVueDef` to `generateVueJsonSchema`
- [ ] 3.2 Update output type from `JsonVueComponentDef` to `VueJsonSchema`
- [ ] 3.3 Implement `designNodeToVNodeDefinition()` function
- [ ] 3.4 Implement `convertEventsToMethods()` for events → methods conversion
- [ ] 3.5 Implement `convertVModel()` for v-model → directives conversion
- [ ] 3.6 Implement `convertDataSource()` for dataSource → lifecycle/computed
- [ ] 3.7 Implement `convertSlots()` for slots handling
- [ ] 3.8 Fix function format: `{ type: 'function', params: '{{{...}}}', body: '{{...}}' }`
- [ ] 3.9 Update state definition format to use `ref`/`reactive` with proper initial values
- [ ] 3.10 Run typecheck and fix any type errors

## 4. FormPreview.vue - Vue-json Integration

- [ ] 4.1 Import vue-json and plugin-antd dependencies
- [ ] 4.2 Add plugin initialization in setup (reference enterprise-admin pattern)
- [ ] 4.3 Replace manual `buildVNode()` with `createComponent()`
- [ ] 4.4 Create computed `previewComponent` using `generateVueJsonSchema()`
- [ ] 4.5 Update template to use `<component :is="previewComponent" />`
- [ ] 4.6 Register antd components globally or via extraComponents
- [ ] 4.7 Handle plugin initialization state (loading/error)
- [ ] 4.8 Test preview rendering with complex forms

## 5. JsonPreview.vue - Format Update

- [ ] 5.1 Update to display standard VueJsonSchema format
- [ ] 5.2 Use `parseSchema()` to validate before display (optional)
- [ ] 5.3 Update JSON output to match VueJsonSchema structure
- [ ] 5.4 Ensure apply button works with new schema format

## 6. AI Tools - Import Fix

- [ ] 6.1 Remove invalid `@json-vue/schema` import in tools.ts
- [ ] 6.2 Implement `validateDesignSchema()` using `parseSchema()`
- [ ] 6.3 Update tool descriptions to reference correct schema format
- [ ] 6.4 Update `GET_CURRENT_DESIGN_TOOL` output format
- [ ] 6.5 Update `APPLY_SCHEMA_TOOL` to handle VueJsonSchema

## 7. Plugin Architecture (Reference enterprise-admin)

- [ ] 7.1 Create plugin loader configuration in DesignerShell
- [ ] 7.2 Implement `setupPlugins()` function using `loadAndInstallPlugins()`
- [ ] 7.3 Register antd components via `registerGlobalComponents()`
- [ ] 7.4 Initialize core scope with `createCoreScope()` and plugin extensions

## 8. Index.ts - Export Updates

- [ ] 8.1 Verify exported types are correct
- [ ] 8.2 Update any incorrect type references in exports
- [ ] 8.3 Ensure new schema generator function is exported

## 9. Verification

- [ ] 9.1 Run `npm run typecheck` - all errors fixed
- [ ] 9.2 Run `npm run lint` - no warnings
- [ ] 9.3 Run `npm test` - all tests pass
- [ ] 9.4 Manual test: designer loads and displays component palette
- [ ] 9.5 Manual test: drag-drop component creates DesignNode
- [ ] 9.6 Manual test: FormPreview renders using createComponent
- [ ] 9.7 Manual test: JsonPreview shows valid VueJsonSchema
- [ ] 9.8 Manual test: AI tools validate and apply schemas correctly
