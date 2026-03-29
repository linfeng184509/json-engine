## 1. Types Definition

- [ ] 1.1 Define ExpressionValue interface in types/schema.ts
- [ ] 1.2 Define FunctionValue interface in types/schema.ts
- [ ] 1.3 Define StateRef interface in types/schema.ts
- [ ] 1.4 Define PropsRef interface in types/schema.ts
- [ ] 1.5 Define ScopeRef interface in types/schema.ts
- [ ] 1.6 Define PropertyValue union type
- [ ] 1.7 Define VNodeDefinition with structured types
- [ ] 1.8 Define VNodeDirectives with structured types
- [ ] 1.9 Define VNodeChildren type
- [ ] 1.10 Update MethodsDefinition to use FunctionValue
- [ ] 1.11 Update ComputedDefinition to use FunctionValue
- [ ] 1.12 Update LifecycleDefinition to use FunctionValue
- [ ] 1.13 Update StateDefinition to use PropertyValue for initial
- [ ] 1.14 Update PropsDefinition to use PropertyValue for default
- [ ] 1.15 Update WatchDefinition to use ExpressionValue and FunctionValue
- [ ] 1.16 Export all new types from types/index.ts

## 2. Parser Layer

- [ ] 2.1 Import parseJson and related types from core-engine in parser/index.ts
- [ ] 2.2 Create parseSchema using parseJson as preprocessing
- [ ] 2.3 Register default KeyParsers for component name transformation
- [ ] 2.4 Update validateSchemaStructure for new Schema format
- [ ] 2.5 Update props-parser.ts to validate PropertyValue defaults
- [ ] 2.6 Update state-parser.ts to validate PropertyValue initials
- [ ] 2.7 Update computed-parser.ts to validate FunctionValue
- [ ] 2.8 Update methods-parser.ts to validate FunctionValue
- [ ] 2.9 Update lifecycle-parser.ts to validate FunctionValue
- [ ] 2.10 Update watch-parser.ts to validate ExpressionValue and FunctionValue
- [ ] 2.11 Update render-parser.ts to validate structured VNodeDefinition
- [ ] 2.12 Update directives validation in render-parser.ts

## 3. Runtime - State and Computed

- [ ] 3.1 Update state-factory.ts to handle PropertyValue initial values
- [ ] 3.2 Implement resolvePropertyValue helper for initial values
- [ ] 3.3 Update computed-factory.ts to handle FunctionValue
- [ ] 3.4 Extract function body from FunctionValue for computed getter/setter

## 4. Runtime - Component Factory

- [ ] 4.1 Update component-factory.ts to use parsed Schema
- [ ] 4.2 Update createMethods to handle FunctionValue
- [ ] 4.3 Ensure provide/inject works with structured values
- [ ] 4.4 Update setupWatchers for new watch definition format

## 5. Runtime - Lifecycle

- [ ] 5.1 Update lifecycle-factory.ts to handle FunctionValue
- [ ] 5.2 Create hook handler from FunctionValue
- [ ] 5.3 Support FunctionValue arrays for lifecycle hooks

## 6. Runtime - Directive

- [ ] 6.1 Update directive-runtime.ts imports for structured types
- [ ] 6.2 Update applyVIf to handle ExpressionValue
- [ ] 6.3 Update applyVShow to handle ExpressionValue
- [ ] 6.4 Update applyVFor source to handle ExpressionValue
- [ ] 6.5 Update applyVModel to require StateRef or PropsRef
- [ ] 6.6 Update applyVBind to handle ExpressionValue
- [ ] 6.7 Update applyVOn to handle FunctionValue
- [ ] 6.8 Update applyVHtml to handle ExpressionValue
- [ ] 6.9 Update applyVText to handle ExpressionValue
- [ ] 6.10 Create resolvePropertyValue helper for directives

## 7. Runtime - Render Factory

- [ ] 7.1 Update render-factory.ts imports for structured types
- [ ] 7.2 Create resolvePropertyValue function
- [ ] 7.3 Update resolveNodeProps to handle PropertyValue
- [ ] 7.4 Update resolveNodeChildren to handle structured types
- [ ] 7.5 Update renderFunction to handle FunctionValue
- [ ] 7.6 Update renderVNodeDefinition for new types

## 8. Utils - Expression

- [ ] 8.1 Simplify expression.ts to use parsed data
- [ ] 8.2 Update evaluateExpression to work with ExpressionValue.body
- [ ] 8.3 Create evaluatePropertyValue helper
- [ ] 8.4 Remove legacy string parsing logic

## 9. Tests - Types

- [ ] 9.1 Add tests for ExpressionValue type validation
- [ ] 9.2 Add tests for FunctionValue type validation
- [ ] 9.3 Add tests for StateRef and PropsRef validation
- [ ] 9.4 Add tests for VNodeDefinition with structured types

## 10. Tests - Parser

- [ ] 10.1 Rewrite schema-parser.test.ts for new format
- [ ] 10.2 Add tests for parseJson integration
- [ ] 10.3 Add tests for KeyParser functionality
- [ ] 10.4 Update props-parser.test.ts
- [ ] 10.5 Update state-parser.test.ts
- [ ] 10.6 Update computed-parser.test.ts
- [ ] 10.7 Update methods-parser.test.ts
- [ ] 10.8 Update lifecycle-parser.test.ts

## 11. Tests - Runtime

- [ ] 11.1 Rewrite component-creation.test.ts for new format
- [ ] 11.2 Update state-factory.test.ts for PropertyValue
- [ ] 11.3 Update computed-factory.test.ts for FunctionValue
- [ ] 11.4 Update lifecycle-factory.test.ts for FunctionValue
- [ ] 11.5 Rewrite directive-runtime.test.ts for structured types
- [ ] 11.6 Rewrite render-factory.test.ts for structured types

## 12. Examples

- [ ] 12.1 Rewrite counter.json with new format
- [ ] 12.2 Rewrite form.json with new format
- [ ] 12.3 Rewrite todo-list.json with new format

## 13. Documentation

- [ ] 13.1 Rewrite README.md for new Schema format
- [ ] 13.2 Add detailed type reference documentation
- [ ] 13.3 Add migration guide from old format
- [ ] 13.4 Update API reference

## 14. Final Verification

- [ ] 14.1 Run typecheck and fix all errors
- [ ] 14.2 Run all tests and ensure 100% pass rate
- [ ] 14.3 Verify examples work correctly
- [ ] 14.4 Final code review