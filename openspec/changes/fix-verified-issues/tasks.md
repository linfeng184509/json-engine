## 1. Shared Utilities & Logging

- [ ] 1.1 Create `src/utils/validate-function.ts` with shared `validateFunctionValue`
- [ ] 1.2 Create `src/utils/logger.ts` with structured Logger class supporting levels
- [ ] 1.3 Replace all 31 `console.log` calls with Logger in vue-json
- [ ] 1.4 Update all parser files to import `validateFunctionValue` from shared utility
- [ ] 1.5 Remove 4 duplicate `validateFunctionValue` definitions

## 2. Type System Fixes

- [ ] 2.1 Remove duplicate `VueJsonSchema` from `types/app.ts`
- [ ] 2.2 Update `types/index.ts` to export single `VueJsonSchema` and alias `VueJsonSchemaType`
- [ ] 2.3 Run typecheck to verify no breaking imports

## 3. Core-Engine Cache Integration

- [ ] 3.1 Convert `ParserCache` from FIFO to true LRU (move-to-end on get)
- [ ] 3.2 Optimize `evictExpired` to avoid O(n) scan on every set
- [ ] 3.3 Add cache lookup in `walkJson` before parsing each value
- [ ] 3.4 Add cache store in `walkJson` after parsing each value
- [ ] 3.5 Add cache key generation utility (path + value hash)

## 4. Error Handling Unification

- [ ] 4.1 Create internal `handleParseError` helper in `parseJson.ts`
- [ ] 4.2 Replace all 6 error handling branches with unified helper
- [ ] 4.3 Add warning for `$ref` without dot separator

## 5. Directive Runtime - v-else/v-else-if

- [ ] 5.1 Add `applyVElseIf` function in `directive-runtime.ts`
- [ ] 5.2 Add `applyVElse` function in `directive-runtime.ts`
- [ ] 5.3 Implement conditional chain evaluation in `render-factory.ts`
- [ ] 5.4 Add tests for v-else-if chain scenarios
- [ ] 5.5 Add tests for v-else fallback scenarios

## 6. Browser Compatibility

- [ ] 6.1 Guard `writeTypeDefinition` with Node.js environment check
- [ ] 6.2 Fix `checkPeerDependencies` for browser/ESM compatibility
- [ ] 6.3 Add tests for browser environment graceful degradation

## 7. Test Coverage

- [ ] 7.1 Add tests for `schema-validator.ts` (all validation rules)
- [ ] 7.2 Add tests for `ParserCache` LRU behavior
- [ ] 7.3 Add tests for cache integration in `parseJson`
- [ ] 7.4 Add tests for Logger utility
- [ ] 7.5 Run full test suite and verify all pass

## 8. Cleanup & Verification

- [ ] 8.1 Run `npm run lint` and fix all issues
- [ ] 8.2 Run `npm run typecheck` and fix all issues
- [ ] 8.3 Run `npm test` and verify all 383+ tests pass
- [ ] 8.4 Verify no remaining `console.log` in production code
- [ ] 8.5 Verify no remaining duplicate `validateFunctionValue` definitions
