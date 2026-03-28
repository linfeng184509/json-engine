import type { RenderDefinition, VNodeDefinition, ParserContext } from '../types';
import { createValidationError } from '../utils/error';

function validateVNode(node: VNodeDefinition, path: string, context: ParserContext): void {
  if (!node.type || typeof node.type !== 'string') {
    throw createValidationError(
      `${path}.type`,
      'VNode must have a "type" string'
    );
  }

  if (node.children !== undefined) {
    if (typeof node.children !== 'string' && !Array.isArray(node.children)) {
      throw createValidationError(
        `${path}.children`,
        'VNode children must be a string or array',
        'string | array',
        node.children
      );
    }

    if (Array.isArray(node.children)) {
      node.children.forEach((child, index) => {
        if (typeof child === 'object' && child !== null && 'type' in child) {
          validateVNode(child as VNodeDefinition, `${path}.children[${index}]`, context);
        }
      });
    }
  }

  if (node.directives) {
    if (node.directives.vFor) {
      if (!node.directives.vFor.source || !node.directives.vFor.alias) {
        context.errors.push({
          path: `${path}.directives.vFor`,
          message: 'vFor must have "source" and "alias"',
          value: node.directives.vFor,
        });
      }
    }
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