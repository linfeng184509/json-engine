export class SchemaParseError extends Error {
    path;
    value;
    constructor(path, message, value) {
        super(`[SchemaParseError] at "${path}": ${message}`);
        this.name = 'SchemaParseError';
        this.path = path;
        this.value = value;
    }
}
export class ValidationError extends Error {
    path;
    expectedType;
    actualValue;
    constructor(path, message, expectedType, actualValue) {
        super(`[ValidationError] at "${path}": ${message}`);
        this.name = 'ValidationError';
        this.path = path;
        this.expectedType = expectedType;
        this.actualValue = actualValue;
    }
}
export class ExpressionError extends Error {
    expression;
    cause;
    constructor(expression, message, cause) {
        super(`[ExpressionError] "${expression}": ${message}`);
        this.name = 'ExpressionError';
        this.expression = expression;
        this.cause = cause;
    }
}
export class ComponentCreationError extends Error {
    componentName;
    cause;
    constructor(componentName, message, cause) {
        super(`[ComponentCreationError] "${componentName}": ${message}`);
        this.name = 'ComponentCreationError';
        this.componentName = componentName;
        this.cause = cause;
    }
}
export class DirectiveError extends Error {
    directive;
    node;
    constructor(directive, message, node) {
        super(`[DirectiveError] ${directive}: ${message}`);
        this.name = 'DirectiveError';
        this.directive = directive;
        this.node = node;
    }
}
export function createParseError(path, message, value) {
    return new SchemaParseError(path, message, value);
}
export function createValidationError(path, message, expectedType, actualValue) {
    return new ValidationError(path, message, expectedType, actualValue);
}
export function createExpressionError(expression, message, cause) {
    return new ExpressionError(expression, message, cause);
}
export function createComponentError(componentName, message, cause) {
    return new ComponentCreationError(componentName, message, cause);
}
export function createDirectiveError(directive, message, node) {
    return new DirectiveError(directive, message, node);
}
export function aggregateErrors(errors) {
    const messages = errors.map((e) => e.message).join('\n');
    return new AggregateError(errors, `Multiple errors occurred:\n${messages}`);
}
//# sourceMappingURL=error.js.map