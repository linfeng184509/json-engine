## 1. Expression Evaluation Caching

- [x] 1.1 Export `functionCache` from `expression.ts` for use by `value-resolver.ts`
- [x] 1.2 Modify `evaluateStringExpression()` in `value-resolver.ts` to check `functionCache` before `new Function()`
- [x] 1.3 Store compiled Function in cache on miss, retrieve on hit
- [x] 1.4 Add unit tests for Function cache hit/miss behavior
- [x] 1.5 Verify existing tests pass after caching changes

## 2. Proxy Singleton in RenderContext

- [x] 2.1 Add `stateProxy` and `computedProxy` optional fields to `RenderContext` type
- [x] 2.2 Create proxies once in `component-creator.ts` `setup()` and attach to context
- [x] 2.3 Update `evaluateStringExpression()` to use context proxies when available
- [x] 2.4 Update `directive-runtime.ts` functions (`applyVIf`, `applyVShow`, `applyVBind`, `applyVHtml`, `applyVText`, `applyVElseIf`) to use context proxies
- [x] 2.5 Update `render-factory.ts` (`resolveNodeChildren`, slot rendering) to use context proxies
- [x] 2.6 Maintain backward compatibility: fall back to on-demand proxy creation if context lacks proxy fields
- [x] 2.7 Add unit tests for proxy reuse behavior
- [x] 2.8 Verify existing tests pass after proxy changes

## 3. Validation and Cleanup

- [x] 3.1 Run `npm run lint` and fix all issues
- [x] 3.2 Run `npm run typecheck` and fix all type errors
- [x] 3.3 Run `npm test` and ensure all tests pass
