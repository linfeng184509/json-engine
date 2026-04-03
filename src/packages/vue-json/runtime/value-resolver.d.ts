import type { PropertyValue, RenderContext } from '../types';
import type { AbstractReferenceParseData, AbstractScopeParseData } from '@json-engine/core-engine';
import { isReferenceParseData, isExpressionParseData, isFunctionParseData, isScopeParseData } from '@json-engine/core-engine';
import type { FunctionValue } from '../types';
type ExpressionResult = string | AbstractReferenceParseData | AbstractScopeParseData;
export { isReferenceParseData, isExpressionParseData, isFunctionParseData, isScopeParseData, };
export declare function isStateReference(value: unknown): value is AbstractReferenceParseData & {
    prefix: 'state';
};
export declare function isPropsReference(value: unknown): value is AbstractReferenceParseData & {
    prefix: 'props';
};
export declare function isComputedReference(value: unknown): value is AbstractReferenceParseData & {
    prefix: 'computed';
};
export declare function isEChartsOption(value: unknown): value is {
    _type: 'echarts-option';
    option: unknown;
};
export declare function resolvePropertyValue(value: PropertyValue, context: RenderContext): unknown;
export declare function evaluateExpression(expression: ExpressionResult, context: RenderContext): unknown;
export declare function transformFunctionBody(body: string): string;
export declare function executeFunction(fnValue: FunctionValue, context: RenderContext, args?: unknown[]): unknown;
//# sourceMappingURL=value-resolver.d.ts.map