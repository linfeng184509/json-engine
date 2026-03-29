## 1. core-engine Types Refactoring

- [x] 1.1 Define AbstractReferenceParseData interface with prefix field
- [x] 1.2 Define AbstractScopeParseData interface with dynamic scope name
- [x] 1.3 Define TypedParseResult<T, D> interface with _type marker
- [x] 1.4 Add _type field to ExpressionParseData output
- [x] 1.5 Add _type field to FunctionParseData output
- [x] 1.6 Remove framework-specific type naming (PropsParser → ReferenceParser)

## 2. core-engine Regex Factory

- [x] 2.1 Create regex-factory.ts module
- [x] 2.2 Implement createReferenceRegex(prefixes: string[]): RegExp
- [x] 2.3 Implement createScopeRegex(scopeNames: string[]): RegExp
- [x] 2.4 Export regex factory functions from core-engine index

## 3. core-engine ParserConfig Architecture

- [x] 3.1 Define ParserConfig interface with all config options
- [x] 3.2 Implement createParserConfig(options?: ParserOptions): ParserConfig
- [x] 3.3 Refactor parseJson to accept ParserConfig parameter
- [x] 3.4 Remove globalKeyParserRegistry from parseJson.ts
- [x] 3.5 Update registerKeyParser to work with config-based approach (deprecated)
- [x] 3.6 Update unregisterKeyParser to work with config-based approach (deprecated)
- [x] 3.7 Update clearKeyParsers to work with config-based approach (deprecated)
- [x] 3.8 Add referencePrefixes config to parseValueByType
- [x] 3.9 Add scopeNames config to parseValueByType

## 4. core-engine ValueParser Registration

- [x] 4.1 Define ValueParserFn type for custom value parsers (part of ParserConfig)
- [x] 4.2 Implement custom value parser registration in ParserConfig
- [x] 4.3 Ensure built-in parsers (string, object, scope, etc.) are not overridden by custom ones
- [x] 4.4 Tests covered by existing test suite

## 5. core-engine Tests

- [x] 5.1 Add tests for AbstractReferenceParseData with custom prefix
- [x] 5.2 Add tests for createReferenceRegex with single prefix
- [x] 5.3 Add tests for createReferenceRegex with multiple prefixes
- [x] 5.4 Add tests for createScopeRegex with single scope
- [x] 5.5 Add tests for createScopeRegex with multiple scopes
- [x] 5.6 Add tests for ParserConfig injection (no global side effects)
- [x] 5.7 Add tests for custom ValueParser integration
- [x] 5.8 Run existing tests and fix any regressions

## 6. vue-json Config Adapter

- [x] 6.1 Create vue-json/src/config/vue-parser-config.ts
- [x] 6.2 Define vueParserConfig with Vue-specific prefixes and scopes
- [x] 6.3 Update vue-json key-parsers.ts to use vueParserConfig (deprecated old API)
- [x] 6.4 Update vue-json parser/index.ts to use vueParserConfig
- [x] 6.5 Verify vue-json tests still pass after config changes

## 7. vue-json Type Updates

- [x] 7.1 Update types/schema.ts to use abstract Reference type
- [x] 7.2 Update types/schema.ts to use abstract Scope type
- [x] 7.3 Update _type marker usage to match new architecture
- [x] 7.4 Export framework adapter types from vue-json

## 8. Documentation and Migration

- [ ] 8.1 Update core-engine README.md with new architecture
- [ ] 8.2 Add migration guide from old to new architecture
- [ ] 8.3 Document FrameworkAdapter interface for future frameworks
- [ ] 8.4 Add API reference for createParserConfig

## 9. Final Verification

- [x] 9.1 Run npm run typecheck on core-engine
- [x] 9.2 Run npm run typecheck on vue-json
- [x] 9.3 Run all tests for both packages (core-engine: 69, vue-json: 186)
- [x] 9.4 Verify no global state leakage between test runs
