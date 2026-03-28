## 1. Core-engine Integration Setup

- [ ] 1.1 Import core-engine exports in parser/index.ts
- [ ] 1.2 Import parseNestedReference in utils/expression.ts
- [ ] 1.3 Import core-engine types (NestedReferenceData, ParseResult)
- [ ] 1.4 Create src/parser/key-parsers.ts with default KeyParsers

## 2. parseJson Integration in parser/index.ts

- [ ] 2.1 Modify parseSchema to call parseJson for string input
- [ ] 2.2 Modify parseSchema to call parseJson for object input
- [ ] 2.3 Pass KeyParser registry to parseJson config
- [ ] 2.4 Update error handling to preserve parseJson errors

## 3. Expression Evaluation Integration

- [ ] 3.1 Create resolveReference helper using parseNestedReference
- [ ] 3.2 Handle state reference type in resolveReference
- [ ] 3.3 Handle props reference type in resolveReference
- [ ] 3.4 Handle scope reference type in resolveReference
- [ ] 3.5 Modify evaluateExpression to use resolveReference first
- [ ] 3.6 Add fallback logic for non-reference expressions

## 4. Runtime Expression Adaptation

- [ ] 4.1 Update directive-runtime.ts applyVIf to use core-engine format
- [ ] 4.2 Update directive-runtime.ts applyVShow to use core-engine format
- [ ] 4.3 Update directive-runtime.ts applyVFor source to use core-engine format
- [ ] 4.4 Update directive-runtime.ts applyVModel prop to use core-engine format
- [ ] 4.5 Update directive-runtime.ts applyVBind to use core-engine format
- [ ] 4.6 Update directive-runtime.ts applyVHtml/applyVText to use core-engine format
- [ ] 4.7 Update directive-runtime.ts setExpressionValue for core-engine format

## 5. Render Factory Adaptation

- [ ] 5.1 Update render-factory.ts resolveNodeChildren for core-engine format
- [ ] 5.2 Update render-factory.ts resolveNodeProps for core-engine format
- [ ] 5.3 Ensure mixed expressions ({{ref_state_x}} + 1) work correctly

## 6. KeyParser Implementation

- [ ] 6.1 Create component-name KeyParser (kebab-case → PascalCase)
- [ ] 6.2 Create state-key KeyParser with validation
- [ ] 6.3 Create registerVueJsonKeyParser wrapper function
- [ ] 6.4 Create unregisterVueJsonKeyParser wrapper function
- [ ] 6.5 Export KeyParser functions from vue-json index.ts

## 7. Test Migration

- [ ] 7.1 Update component-creation.test.ts to use core-engine format
- [ ] 7.2 Update directive-runtime.test.ts to use core-engine format
- [ ] 7.3 Update render-factory.test.ts to use core-engine format
- [ ] 7.4 Update state-factory.test.ts to use core-engine format
- [ ] 7.5 Update computed-factory.test.ts to use core-engine format
- [ ] 7.6 Update lifecycle-factory.test.ts to use core-engine format
- [ ] 7.7 Add tests for parseNestedReference integration
- [ ] 7.8 Add tests for KeyParser functionality

## 8. Documentation and Cleanup

- [ ] 8.1 Update README.md with core-engine format examples
- [ ] 8.2 Add migration guide for legacy format users
- [ ] 8.3 Remove redundant expression parsing code
- [ ] 8.4 Run typecheck and fix any type errors
- [ ] 8.5 Run all tests and ensure 100% pass rate