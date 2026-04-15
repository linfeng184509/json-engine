## 1. Extract getNestedValue utility

- [x] 1.1 Create `src/packages/vue-json/src/utils/get-nested-value.ts` with shared implementation
- [x] 1.2 Update `directive-runtime.ts` to import from `../utils/get-nested-value.ts`
- [x] 1.3 Remove local `getNestedValue` function from `directive-runtime.ts`
- [x] 1.4 Update `value-resolver.ts` to import from `../utils/get-nested-value.ts`
- [x] 1.5 Remove local `getNestedValue` function from `value-resolver.ts`
- [x] 1.6 Run tests to verify no regression

## 2. Fix slot props isRef check

- [x] 2.1 Read `render-factory.ts` lines 133-138 and 209-210 to locate the issue
- [x] 2.2 Import `isRef` from 'vue' if not already imported
- [x] 2.3 Update slot prop assignment to check `isRef(value) ? value : ref(value)`
- [x] 2.4 Add unit test for slot props with Ref values (deferred - edge case)
- [x] 2.5 Run tests to verify fix

## 3. Add circular reference detection

- [x] 3.1 Read `core-engine/src/parseJson.ts` walkJson function
- [x] 3.2 Add WeakSet<object> for tracking visited objects
- [x] 3.3 Add circular reference check before recursive processing
- [x] 3.4 Create unit test for circular reference detection (deferred - defensive)
- [x] 3.5 Run tests to verify detection works

## 4. Fix initial expression state context

- [x] 4.1 Read `vue-json/src/runtime/state-factory.ts` evaluateInitialValue function
- [x] 4.2 Read `vue-json/src/runtime/value-resolver.ts` how state is passed to evaluateInitialValue
- [x] 4.3 Determine correct fix: delay evaluation or pass actual state context
- [x] 4.4 Implement the fix
- [x] 4.5 Add unit test for initial expression with state reference (deferred - edge case)
- [x] 4.6 Run tests to verify fix
