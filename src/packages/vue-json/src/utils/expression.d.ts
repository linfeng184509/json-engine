import type { RenderContext } from '../types/runtime';
declare const functionCache: import("@json-engine/core-engine").ParserCache;
export { functionCache };
export declare function resolveReference(expression: string, context: RenderContext): unknown;
export declare function evaluateFunction(functionBody: string, context: RenderContext, args?: unknown[]): unknown;
export declare function clearExpressionCache(): void;
//# sourceMappingURL=expression.d.ts.map