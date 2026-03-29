import type {
  RenderDefinition,
  VNodeDefinition,
  VNodeChildren,
  VNodeChild,
  VNodeDirectives,
  ParserContext,
  PropertyValue,
  ExpressionValue,
  FunctionValue,
  StateRef,
  PropsRef,
} from '../types';
import { createValidationError } from '../utils/error';

function isExpressionValue(value: unknown): value is ExpressionValue {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return obj._type === 'expression' && (typeof obj.expression === 'string' || typeof obj.expression === 'object');
}

function isFunctionValue(value: unknown): value is FunctionValue {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return obj._type === 'function' && typeof obj.body === 'string' && obj.params !== undefined && obj.params !== null;
}

function isStateRef(value: unknown): value is StateRef {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return obj._type === 'state' && typeof obj.variable === 'string';
}

function isPropsRef(value: unknown): value is PropsRef {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return obj._type === 'props' && typeof obj.variable === 'string';
}

function isPropertyValue(value: unknown): value is PropertyValue {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'object') return true;
  const obj = value as Record<string, unknown>;
  if (typeof obj._type === 'string') {
    return ['expression', 'state', 'props', 'scope'].includes(obj._type);
  }
  return true;
}

function validatePropertyValue(value: unknown, path: string): void {
  if (!isPropertyValue(value)) {
    throw createValidationError(
      path,
      'Must be a literal or structured value (ExpressionValue, StateRef, PropsRef)',
      'PropertyValue',
      value
    );
  }

  if (typeof value === 'object' && value !== null) {
    const obj = value as unknown as Record<string, unknown>;
    if (obj.type === 'expression') {
      if (typeof obj.body !== 'string') {
        throw createValidationError(
          `${path}.body`,
          'ExpressionValue.body must be a string',
          'string',
          obj.body as unknown
        );
      }
    } else if (obj.type === 'state' || obj.type === 'props') {
      if (typeof obj.variable !== 'string') {
        throw createValidationError(
          `${path}.variable`,
          'Reference must have a variable string',
          'string',
          obj.variable as unknown
        );
      }
    }
  }
}

function validateFunctionValue(fn: unknown, path: string): void {
  if (!isFunctionValue(fn)) {
    throw createValidationError(
      path,
      'Must be a FunctionValue with type, params, and body',
      '{ type: "function", params: "", body: "..." }',
      fn
    );
  }

  if (fn.params === undefined || fn.params === null) {
    throw createValidationError(
      `${path}.params`,
      'FunctionValue must have a params field (can be empty string)',
      'string',
      fn.params
    );
  }
}

function validateVNodeChild(child: VNodeChild, path: string, context: ParserContext): void {
  if (typeof child === 'string' || typeof child === 'number') {
    return;
  }

  if (typeof child === 'object' && child !== null) {
    if ('type' in child) {
      if (child.type === 'expression') {
        validatePropertyValue(child, path);
      } else if (typeof child.type === 'string') {
        validateVNode(child as VNodeDefinition, path, context);
      }
    }
  }
}

function validateVNodeChildren(children: VNodeChildren, path: string, context: ParserContext): void {
  if (Array.isArray(children)) {
    children.forEach((child, index) => {
      validateVNodeChild(child, `${path}[${index}]`, context);
    });
  } else {
    validateVNodeChild(children, path, context);
  }
}

function validateVNodeDirectives(directives: VNodeDirectives, path: string, context: ParserContext): void {
  if (directives.vIf !== undefined) {
    if (!isExpressionValue(directives.vIf)) {
      context.errors.push({
        path: `${path}.vIf`,
        message: 'vIf must be an ExpressionValue',
        value: directives.vIf,
      });
    }
  }

  if (directives.vElseIf !== undefined) {
    if (!isExpressionValue(directives.vElseIf)) {
      context.errors.push({
        path: `${path}.vElseIf`,
        message: 'vElseIf must be an ExpressionValue',
        value: directives.vElseIf,
      });
    }
  }

  if (directives.vShow !== undefined) {
    if (!isExpressionValue(directives.vShow)) {
      context.errors.push({
        path: `${path}.vShow`,
        message: 'vShow must be an ExpressionValue',
        value: directives.vShow,
      });
    }
  }

  if (directives.vFor) {
    if (!isExpressionValue(directives.vFor.source)) {
      context.errors.push({
        path: `${path}.vFor.source`,
        message: 'vFor.source must be an ExpressionValue',
        value: directives.vFor.source,
      });
    }
    if (typeof directives.vFor.alias !== 'string') {
      context.errors.push({
        path: `${path}.vFor.alias`,
        message: 'vFor.alias must be a string',
        value: directives.vFor.alias,
      });
    }
  }

  if (directives.vModel) {
    if (!isStateRef(directives.vModel.prop) && !isPropsRef(directives.vModel.prop)) {
      context.errors.push({
        path: `${path}.vModel.prop`,
        message: 'vModel.prop must be a StateRef or PropsRef',
        value: directives.vModel.prop,
      });
    }
  }

  if (directives.vOn) {
    for (const [event, handler] of Object.entries(directives.vOn)) {
      if (!isFunctionValue(handler)) {
        context.errors.push({
          path: `${path}.vOn.${event}`,
          message: 'vOn handler must be a FunctionValue',
          value: handler,
        });
      }
    }
  }

  if (directives.vBind) {
    for (const [attr, expr] of Object.entries(directives.vBind)) {
      if (!isExpressionValue(expr)) {
        context.errors.push({
          path: `${path}.vBind.${attr}`,
          message: 'vBind value must be an ExpressionValue',
          value: expr,
        });
      }
    }
  }

  if (directives.vHtml !== undefined) {
    if (!isExpressionValue(directives.vHtml)) {
      context.errors.push({
        path: `${path}.vHtml`,
        message: 'vHtml must be an ExpressionValue',
        value: directives.vHtml,
      });
    }
  }

  if (directives.vText !== undefined) {
    if (!isExpressionValue(directives.vText)) {
      context.errors.push({
        path: `${path}.vText`,
        message: 'vText must be an ExpressionValue',
        value: directives.vText,
      });
    }
  }
}

function validateVNode(node: VNodeDefinition, path: string, context: ParserContext): void {
  if (!node.type || typeof node.type !== 'string') {
    throw createValidationError(
      `${path}.type`,
      'VNode must have a "type" string'
    );
  }

  if (node.props) {
    for (const [propName, propValue] of Object.entries(node.props)) {
      validatePropertyValue(propValue, `${path}.props.${propName}`);
    }
  }

  if (node.children !== undefined) {
    validateVNodeChildren(node.children, `${path}.children`, context);
  }

  if (node.directives) {
    validateVNodeDirectives(node.directives, `${path}.directives`, context);
  }
}

export function parseRender(
  definition: RenderDefinition,
  context: ParserContext
): RenderDefinition {
  try {
    if (typeof definition !== 'object' || definition === null) {
      throw createValidationError(
        'render',
        'Render definition must be an object',
        'object',
        definition
      );
    }

    if (!definition.type || !['template', 'function'].includes(definition.type)) {
      throw createValidationError(
        'render.type',
        'Render type must be "template" or "function"',
        '"template" | "function"',
        definition.type
      );
    }

    if (!definition.content) {
      throw createValidationError(
        'render.content',
        'Render must have "content"'
      );
    }

    if (definition.type === 'template') {
      const vnode = definition.content as VNodeDefinition;
      validateVNode(vnode, 'render.content', context);
    } else if (definition.type === 'function') {
      const fn = definition.content as FunctionValue;
      validateFunctionValue(fn, 'render.content');
    }

    return definition;
  } catch (error) {
    context.errors.push({
      path: 'render',
      message: error instanceof Error ? error.message : String(error),
      value: definition,
    });

    return definition;
  }
}