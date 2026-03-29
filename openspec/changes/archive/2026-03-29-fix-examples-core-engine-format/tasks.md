## 1. Type Definitions

- [x] 1.1 Add `path?: string` field to StateRef interface in `src/packages/vue-json/src/types/schema.ts`
- [x] 1.2 Add `path?: string` field to PropsRef interface in `src/packages/vue-json/src/types/schema.ts`
- [x] 1.3 Add `stateTypes?: Record<string, string>` field to RenderContext in `src/packages/vue-json/src/types/runtime.ts`

## 2. Parser Updates

- [x] 2.1 Modify `parseReferenceBody` function in `src/packages/vue-json/src/parser/index.ts` to return `{ variable: string; path?: string }` object
- [x] 2.2 Update `processSchemaWithMarkers` to handle the new return type from `parseReferenceBody`
- [x] 2.3 Update StateRef case to include path field when present
- [x] 2.4 Update PropsRef case to include path field when present

## 3. Runtime Value Resolution

- [x] 3.1 Add `getNestedValue(obj: unknown, path: string): unknown` helper function to `src/packages/vue-json/src/runtime/value-resolver.ts`
- [x] 3.2 Modify `evaluateExpression` to handle NestedReferenceData with path field
- [x] 3.3 Update `evaluateStringExpression` regex patterns to support dot notation in references
- [ ] 3.4 Add unit tests for `getNestedValue` function
- [ ] 3.5 Add unit tests for dot-path expression evaluation

## 4. Function Body Transformation

- [x] 4.1 Add `transformFunctionBody(body: string, stateTypes: Record<string, string>): string` function to `src/packages/vue-json/src/runtime/value-resolver.ts`
- [x] 4.2 Implement regex replacement for `ref_state_xxx` with path support
- [x] 4.3 Implement regex replacement for `ref_props_xxx` with path support
- [x] 4.4 Add logic to handle ref vs reactive `.value` accessor distinction
- [x] 4.5 Modify `executeFunction` to call `transformFunctionBody` before creating Function
- [ ] 4.6 Add unit tests for `transformFunctionBody` function

## 5. Component Factory Updates

- [x] 5.1 Collect stateTypes from schema.state definition in `src/packages/vue-json/src/runtime/component-factory.ts`
- [x] 5.2 Pass stateTypes to RenderContext in the render function

## 6. Example File Fixes

- [ ] 6.1 Fix `counter.json`: Replace `state.count.value` with `ref_state_count` in function bodies
- [ ] 6.2 Fix `counter.json`: Replace `ref_computed_doubleCount` with `computed.doubleCount.value` in expression
- [ ] 6.3 Fix `form.json`: Replace all `state.xxx` references with `ref_state_xxx` format
- [ ] 6.4 Fix `form.json`: Update vModel bindings to use dot-path (`ref_state_formData.name`, etc.)
- [ ] 6.5 Fix `form.json`: Replace `ref_state_formData` vModel prop with specific field references
- [ ] 6.6 Fix `todo-list.json`: Replace `state.xxx.value` with `ref_state_xxx` in function bodies
- [ ] 6.7 Fix `todo-list.json`: Replace `ref_computed_xxx` with `computed.xxx.value` in expressions
- [ ] 6.8 Fix `todo-list.json`: Replace `todo.xxx` with `ref_state_todo.xxx` in vFor expressions

## 7. Integration Testing

- [ ] 7.1 Run vue-json unit tests and verify all pass
- [ ] 7.2 Start vue-json-playground and verify Counter example works (increment/decrement/reset)
- [ ] 7.3 Verify Form example works (validation, submission)
- [ ] 7.4 Verify TodoList example works (add/remove/filter todos)

## 8. Documentation and Cleanup

- [ ] 8.1 Update vue-json README with dot-path reference examples
- [ ] 8.2 Run `npm run lint` and `npm run typecheck` on all modified packages
- [ ] 8.3 Remove any debug code added during development
- [ ] 8.4 Commit changes with descriptive commit message