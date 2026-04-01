import type {
  RenderDefinition,
  VNodeDefinition,
  VNodeChildren,
  VNodeChild,
  VNodeDirectives,
  ParserContext,
  PropertyValue,
  FunctionValue,
} from '../types';
import { isExpressionParseData, isFunctionParseData, isReferenceParseData } from '@json-engine/core-engine';
import { createValidationError, ValidationError } from '../utils/error';

function isPropertyValue(value: unknown): value is PropertyValue {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'object') return true;
  const obj = value as Record<string, unknown>;
  if (typeof obj._type === 'string') {
    return ['expression', 'reference', 'scope', 'string', 'function', 'echarts-option'].includes(obj._type);
  }
  return true;
}

function validatePropertyValue(value: unknown, path: string): void {
  if (!isPropertyValue(value)) {
    throw createValidationError(
      path,
      'Must be a literal or structured value (ExpressionValue, ReferenceParseData)',
      'PropertyValue',
      value
    );
  }
}

function validateFunctionValue(fn: unknown, path: string): void {
  if (!isFunctionParseData(fn)) {
    throw createValidationError(
      path,
      'Must be a FunctionValue with _type="function"',
      '{ _type: "function", params: {}, body: "..." }',
      fn
    );
  }

  if (typeof fn.body !== 'string') {
    throw createValidationError(
      `${path}.body`,
      'FunctionValue.body must be a string',
      'string',
      fn.body
    );
  }

  if (typeof fn.params !== 'object' || fn.params === null) {
    throw createValidationError(
      `${path}.params`,
      'FunctionValue.params must be an object',
      'object',
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
  try {
    if (directives.vIf !== undefined) {
      if (!isExpressionParseData(directives.vIf)) {
        throw createValidationError(
          `${path}.vIf`,
          'vIf must be an ExpressionValue',
          'ExpressionValue',
          directives.vIf
        );
      }
    }

    if (directives.vElseIf !== undefined) {
      if (!isExpressionParseData(directives.vElseIf)) {
        throw createValidationError(
          `${path}.vElseIf`,
          'vElseIf must be an ExpressionValue',
          'ExpressionValue',
          directives.vElseIf
        );
      }
    }

    if (directives.vShow !== undefined) {
      if (!isExpressionParseData(directives.vShow)) {
        throw createValidationError(
          `${path}.vShow`,
          'vShow must be an ExpressionValue',
          'ExpressionValue',
          directives.vShow
        );
      }
    }

    if (directives.vFor) {
      if (!isExpressionParseData(directives.vFor.source)) {
        throw createValidationError(
          `${path}.vFor.source`,
          'vFor.source must be an ExpressionValue',
          'ExpressionValue',
          directives.vFor.source
        );
      }
      if (typeof directives.vFor.alias !== 'string') {
        throw createValidationError(
          `${path}.vFor.alias`,
          'vFor.alias must be a string',
          'string',
          directives.vFor.alias
        );
      }
    }

    if (directives.vModel) {
      if (!isReferenceParseData(directives.vModel.prop)) {
        throw createValidationError(
          `${path}.vModel.prop`,
          'vModel.prop must be a ReferenceParseData (state or props reference)',
          'ReferenceParseData',
          directives.vModel.prop
        );
      }
    }

    if (directives.vOn) {
      for (const [event, handler] of Object.entries(directives.vOn)) {
        if (!isFunctionParseData(handler)) {
          throw createValidationError(
            `${path}.vOn.${event}`,
            'vOn handler must be a FunctionValue',
            'FunctionValue',
            handler
          );
        }
      }
    }

    if (directives.vBind) {
      for (const [attr, expr] of Object.entries(directives.vBind)) {
        if (!isExpressionParseData(expr)) {
          throw createValidationError(
            `${path}.vBind.${attr}`,
            'vBind value must be an ExpressionValue',
            'ExpressionValue',
            expr
          );
        }
      }
    }

    if (directives.vHtml !== undefined) {
      if (!isExpressionParseData(directives.vHtml)) {
        throw createValidationError(
          `${path}.vHtml`,
          'vHtml must be an ExpressionValue',
          'ExpressionValue',
          directives.vHtml
        );
      }
    }

    if (directives.vText !== undefined) {
      if (!isExpressionParseData(directives.vText)) {
        throw createValidationError(
          `${path}.vText`,
          'vText must be an ExpressionValue',
          'ExpressionValue',
          directives.vText
        );
      }
    }
  } catch (error) {
    context.errors.push({
      path: error instanceof ValidationError ? error.path : path,
      message: error instanceof Error ? error.message : String(error),
      value: error instanceof ValidationError ? error.actualValue : undefined,
      expectedType: error instanceof ValidationError ? error.expectedType : undefined,
      actualType: error instanceof ValidationError ? typeof error.actualValue : undefined,
    });
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