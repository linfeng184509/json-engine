export declare class SchemaParseError extends Error {
    path: string;
    value?: unknown;
    constructor(path: string, message: string, value?: unknown);
}
export declare class ValidationError extends Error {
    path: string;
    expectedType?: string;
    actualValue?: unknown;
    constructor(path: string, message: string, expectedType?: string, actualValue?: unknown);
}
export declare class ExpressionError extends Error {
    expression: string;
    cause?: Error;
    constructor(expression: string, message: string, cause?: Error);
}
export declare class ComponentCreationError extends Error {
    componentName: string;
    cause?: Error;
    constructor(componentName: string, message: string, cause?: Error);
}
export declare class DirectiveError extends Error {
    directive: string;
    node?: unknown;
    constructor(directive: string, message: string, node?: unknown);
}
export declare function createParseError(path: string, message: string, value?: unknown): SchemaParseError;
export declare function createValidationError(path: string, message: string, expectedType?: string, actualValue?: unknown): ValidationError;
export declare function createExpressionError(expression: string, message: string, cause?: Error): ExpressionError;
export declare function createComponentError(componentName: string, message: string, cause?: Error): ComponentCreationError;
export declare function createDirectiveError(directive: string, message: string, node?: unknown): DirectiveError;
export declare function aggregateErrors(errors: Error[]): AggregateError;
//# sourceMappingURL=error.d.ts.map