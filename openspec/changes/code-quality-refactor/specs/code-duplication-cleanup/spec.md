## ADDED Requirements

### Requirement: getNestedValue utility function extraction
The system SHALL provide a shared `getNestedValue` utility function in `src/packages/vue-json/src/utils/get-nested-value.ts` that correctly navigates nested object paths.

#### Scenario: Navigate simple path
- **WHEN** calling `getNestedValue({ a: { b: 'value' }}, 'a.b')`
- **THEN** returns `'value'`

#### Scenario: Navigate with array index
- **WHEN** calling `getNestedValue({ items: [{ name: 'test' }] }, 'items.0.name')`
- **THEN** returns `'test'`

#### Scenario: Handle null object
- **WHEN** calling `getNestedValue(null, 'any.path')`
- **THEN** returns `null` or `undefined`

#### Scenario: Handle missing path
- **WHEN** calling `getNestedValue({ a: {} }, 'a.b.c')`
- **THEN** returns `undefined`

### Requirement: Export from both directive-runtime and value-resolver
The system SHALL export the shared `getNestedValue` function from both `directive-runtime.ts` and `value-resolver.ts` modules.

#### Scenario: Import in directive-runtime
- **WHEN** `directive-runtime.ts` needs `getNestedValue`
- **THEN** imports from `../utils/get-nested-value.ts`

#### Scenario: Import in value-resolver
- **WHEN** `value-resolver.ts` needs `getNestedValue`
- **THEN** imports from `../utils/get-nested-value.ts`
