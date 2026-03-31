import { h, type VNode, type Component } from 'vue';
import type {
  VNodeDefinition,
  VNodeChildren,
  RenderDefinition,
  RenderContext,
  FunctionValue,
  PropertyValue,
} from '../types';
import { DirectiveError } from '../utils/error';
import {
  applyVIf,
  applyVShow,
  applyVFor,
  applyVModel,
  applyVOn,
  applyVBind,
  applyVHtml,
  applyVText,
  type VForResult,
} from './directive-runtime';
import { resolvePropertyValue, evaluateExpression, isExpressionValue } from './value-resolver';
import { parseExpressionBody } from '../parser';

export function renderVNode(
  definition: RenderDefinition,
  context: RenderContext
): VNode | null {
  if (definition.type === 'function') {
    return renderFunction(definition.content as FunctionValue, context);
  }

  return renderTemplate(definition.content, context);
}

function renderFunction(fnValue: FunctionValue, context: RenderContext): VNode | null {
  try {
    const fn = new Function(
      'h',
      'props',
      'state',
      'computed',
      'methods',
      'emit',
      'slots',
      'attrs',
      'provide',
      `"use strict"; ${fnValue.body}`
    );

    const result = fn(
      h,
      context.props,
      context.state,
      context.computed,
      context.methods,
      context.emit,
      context.slots,
      context.attrs,
      context.provide
    );

    return result as VNode | null;
  } catch (error) {
    throw new DirectiveError(
      'render-function',
      `Failed to render: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function renderTemplate(node: VNodeDefinition, context: RenderContext): VNode | null {
  return renderVNodeDefinition(node, context);
}

function renderVNodeDefinition(node: VNodeDefinition, context: RenderContext): VNode | null {
  if (node.directives) {
    if (node.directives.vIf !== undefined) {
      const result = applyVIf(node.directives.vIf, context);
      if (!result) return null;
    }

    if (node.directives.vShow !== undefined) {
      const vnode = renderVNodeDefinition({ ...node, directives: undefined }, context);
      if (!vnode) return null;
      return applyVShow(vnode, node.directives.vShow, context);
    }

    if (node.directives.vFor) {
      const results: VForResult[] = applyVFor(node, node.directives.vFor, context);
      const vnodes = results
        .map((result) => renderVNodeDefinition(result.definition, result.context))
        .filter((vn): vn is VNode => vn !== null);
      return vnodes.length > 0 ? vnodes[0] : null;
    }
  }

  const type = resolveNodeType(node.type, context);
  const props = resolveNodeProps(node.props, node.directives, context);
  const children = resolveNodeChildren(node.children, node.directives, context);

  const isComponent = typeof type !== 'string';

  if (isComponent && children) {
    return h(type, props, () => children);
  }

  return h(type, props, children);
}

function resolveNodeType(type: string, context: RenderContext): string | Component {
  if (context.components[type]) {
    return context.components[type];
  }
  return type;
}

function resolveNodeProps(
  props: Record<string, PropertyValue> | undefined,
  directives: VNodeDefinition['directives'],
  context: RenderContext
): Record<string, unknown> | null {
  const result: Record<string, unknown> = {};

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      result[key] = resolvePropertyValue(value, context);
    }
  }

  if (directives?.vBind) {
    Object.assign(result, applyVBind(directives.vBind, context));
  }

  if (directives?.vModel) {
    Object.assign(result, applyVModel(directives.vModel, context));
  }

  if (directives?.vOn) {
    Object.assign(result, applyVOn(directives.vOn, context));
  }

  return Object.keys(result).length > 0 ? result : null;
}

function resolveNodeChildren(
  children: VNodeChildren | undefined,
  directives: VNodeDefinition['directives'],
  context: RenderContext
): string | number | VNode | (string | number | VNode)[] | undefined {
  if (directives?.vHtml !== undefined) {
    return applyVHtml(directives.vHtml, context);
  }

  if (directives?.vText !== undefined) {
    return applyVText(directives.vText, context);
  }

  if (!children) return undefined;

  if (typeof children === 'string') {
    return children;
  }

  if (typeof children === 'number') {
    return children;
  }

  if (isExpressionValue(children)) {
    return String(evaluateExpression(children.expression, context));
  }

  if (Array.isArray(children)) {
    const mapped = children
      .map((child) => {
        if (typeof child === 'string' || typeof child === 'number') {
          return child;
        }
        if (isExpressionValue(child)) {
          return evaluateExpression(child.expression, context);
        }
        if (typeof child === 'object' && child !== null) {
          if ('type' in child) {
            const typeValue = (child as unknown as Record<string, unknown>).type;
            if (typeValue === 'expression') {
              const expressionBody = (child as unknown as Record<string, unknown>).body;
              if (typeof expressionBody === 'string') {
                const expression = parseExpressionBody(expressionBody);
                return evaluateExpression(expression, context);
              }
            }
            return renderVNodeDefinition(child as VNodeDefinition, context);
          }
        }
        return child;
      })
      .filter((child) => child !== null) as (string | number | VNode)[];
    return mapped.length > 0 ? mapped : undefined;
  }

  if (typeof children === 'object' && 'type' in children) {
    return renderVNodeDefinition(children as VNodeDefinition, context) ?? undefined;
  }

  return undefined;
}
