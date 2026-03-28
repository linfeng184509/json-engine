export class SchemaParseError extends Error {
  public path: string;
  public value?: unknown;

  constructor(path: string, message: string, value?: unknown) {
    super(`[SchemaParseError] at "${path}": ${message}`);
    this.name = 'SchemaParseError';
    this.path = path;
    this.value = value;
  }
}

export class ValidationError extends Error {
  public path: string;
  public expectedType?: string;
  public actualValue?: unknown;

  constructor(path: string, message: string, expectedType?: string, actualValue?: unknown) {
    super(`[ValidationError] at "${path}": ${message}`);
    this.name = 'ValidationError';
    this.path = path;
    this.expectedType = expectedType;
    this.actualValue = actualValue;
  }
}

export class ExpressionError extends Error {
  public expression: string;
  public cause?: Error;

  constructor(expression: string, message: string, cause?: Error) {
    super(`[ExpressionError] "${expression}": ${message}`);
    this.name = 'ExpressionError';
    this.expression = expression;
    this.cause = cause;
  }
}

export class ComponentCreationError extends Error {
  public componentName: string;
  public cause?: Error;

  constructor(componentName: string, message: string, cause?: Error) {
    super(`[ComponentCreationError] "${componentName}": ${message}`);
    this.name = 'ComponentCreationError';
    this.componentName = componentName;
    this.cause = cause;
  }
}

export class DirectiveError extends Error {
  public directive: string;
  public node?: unknown;

  constructor(directive: string, message: string, node?: unknown) {
    super(`[DirectiveError] ${directive}: ${message}`);
    this.name = 'DirectiveError';
    this.directive = directive;
    this.node = node;
  }
}

export function createParseError(path: string, message: string, value?: unknown): SchemaParseError {
  return new SchemaParseError(path, message, value);
}

export function createValidationError(
  path: string,
  message: string,
  expectedType?: string,
  actualValue?: unknown
): ValidationError {
  return new ValidationError(path, message, expectedType, actualValue);
}

export function createExpressionError(expression: string, message: string, cause?: Error): ExpressionError {
  return new ExpressionError(expression, message, cause);
}

export function createComponentError(componentName: string, message: string, cause?: Error): ComponentCreationError {
  return new ComponentCreationError(componentName, message, cause);
}

export function createDirectiveError(directive: string, message: string, node?: unknown): DirectiveError {
  return new DirectiveError(directive, message, node);
}

export function aggregateErrors(errors: Error[]): AggregateError {
  const messages = errors.map((e) => e.message).join('\n');
  return new AggregateError(errors, `Multiple errors occurred:\n${messages}`);
}