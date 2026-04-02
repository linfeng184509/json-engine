## 1. core-engine: DSL Input Format Refactor

- [ ] 1.1 Add normalizeValue() function in parseJson.ts to transform $ref/$expr/$fn/$scope to internal AST
- [ ] 1.2 Remove ValueConstraintParser (string type) from types.ts
- [ ] 1.3 Remove ValueObjectParser (object type) from types.ts
- [ ] 1.4 Simplify ValueFunctionParser to accept string body without {{{}}} wrapper
- [ ] 1.5 Remove regex-factory.ts (no longer needed for dynamic ref/scope regex generation)
- [ ] 1.6 Update config-factory.ts to remove scopeNames/referencePrefixes (replaced by fixed $ref/$scope mapping)
- [ ] 1.7 Remove parseNestedReference function from types.ts
- [ ] 1.8 Update parseJson.ts to remove duplicate scope/reference handling paths
- [ ] 1.9 Update core-engine index.ts exports (remove removed items, add normalizeValue)
- [ ] 1.10 Write unit tests for normalizeValue covering $ref/$expr/$fn/$scope formats
- [ ] 1.11 Run core-engine unit tests and verify all pass
- [ ] 1.12 Commit core-engine changes

## 2. vue-json: State Proxy Implementation

- [ ] 2.1 Create createStateProxy() function in state-factory.ts
- [ ] 2.2 Implement auto-unwrap on get (ref.value → value)
- [ ] 2.3 Implement auto-wrap on set (value → ref.value = value)
- [ ] 2.4 Handle all state types: ref, reactive, shallowRef, shallowReactive, readonly, toRef, toRefs
- [ ] 2.5 Integrate State Proxy into RenderContext (replace raw state)
- [ ] 2.6 Write unit tests for State Proxy get/set behavior
- [ ] 2.7 Run vue-json unit tests and verify State Proxy tests pass
- [ ] 2.8 Commit state-proxy changes

## 3. vue-json: Context API Transformation

- [ ] 3.1 Refactor transformFunctionBody() in value-resolver.ts to use simple $state/$props/$computed replacement
- [ ] 3.2 Add $core.api/$core.router/$core.storage/$core.auth/$core.i18n/$core.ws mappings
- [ ] 3.3 Add $ui.antd mapping
- [ ] 3.4 Add $event → args[0] shorthand
- [ ] 3.5 Remove stateType map and conditional .value insertion logic
- [ ] 3.6 Refactor evaluateStringExpression() to use simple replacement (no ref_state_xxx patterns)
- [ ] 3.7 Update resolvePropertyValue() to handle $ref/$expr/$fn/$scope value types
- [ ] 3.8 Remove stateValueParser/propsValueParser fallback hacks from vue-parser-config.ts
- [ ] 3.9 Write unit tests for new transformFunctionBody
- [ ] 3.10 Write unit tests for new evaluateStringExpression
- [ ] 3.11 Run vue-json unit tests and verify all pass
- [ ] 3.12 Commit context-api changes

## 4. vue-json: Directive Runtime Updates

- [ ] 4.1 Update applyVModel() to recognize $ref format in prop field
- [ ] 4.2 Update applyVOn() to recognize $fn format in handler field
- [ ] 4.3 Update directive-runtime.ts to handle $expr in vIf/vShow conditions
- [ ] 4.4 Write unit tests for updated directive handling
- [ ] 4.5 Run vue-json unit tests and verify directive tests pass
- [ ] 4.6 Commit directive-runtime changes

## 5. vue-json: Render Engine Updates

- [ ] 5.1 Update render-factory.ts resolvePropertyValue dispatch for $ref/$expr/$fn/$scope
- [ ] 5.2 Update render-parser.ts validation rules for new value formats
- [ ] 5.3 Update computed-factory.ts to use $state/$computed in function bodies
- [ ] 5.4 Remove parseNestedReference usage from render pipeline
- [ ] 5.5 Write unit tests for updated render engine
- [ ] 5.6 Run vue-json unit tests and verify all pass
- [ ] 5.7 Commit render-engine changes

## 6. Schema Migration

- [ ] 6.1 Create migration script to convert all demo schemas from old to new format
- [ ] 6.2 Run migration script on antd-demo-playground schemas
- [ ] 6.3 Run migration script on enterprise-admin schemas
- [ ] 6.4 Verify migrated schemas parse correctly
- [ ] 6.5 Commit migrated schemas

## 7. Integration Testing

- [ ] 7.1 Run full test suite (npm test) across all packages
- [ ] 7.2 Start dev server and verify antd-demo-playground renders correctly
- [ ] 7.3 Test interactive demos (checkbox, modal, form, etc.)
- [ ] 7.4 Verify enterprise-admin pages load correctly
- [ ] 7.5 Fix any remaining issues
- [ ] 7.6 Run lint and typecheck (npm run lint && npm run typecheck)
- [ ] 7.7 Final commit with all integration fixes
