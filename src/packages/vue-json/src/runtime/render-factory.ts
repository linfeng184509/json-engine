import { h, Fragment, type VNode, type Component } from 'vue';
import type {
  VNodeDefinition,
  VNodeChildren,
  RenderDefinition,
  RenderContext,
  FunctionValue,
  PropertyValue,
} from '../types';
import type { AbstractReferenceParseData, AbstractScopeParseData } from '@json-engine/core-engine';
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
  applyVSlot,
  type VForResult,
} from './directive-runtime';
import { resolvePropertyValue, evaluateExpression, isExpressionParseData } from './value-resolver';

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

  // Handle template elements: render children directly instead of the template element
  if (node.type === 'template') {
    const children = resolveNodeChildren(node.children, node.directives, context);
    if (Array.isArray(children)) {
      return children.length === 1 ? children[0] as VNode : h(Fragment, children);
    }
    if (children) {
      return children as VNode;
    }
    return null;
  }

  const type = resolveNodeType(node.type, context);
  const props = resolveNodeProps(node.props, node.directives, context);
  const isComponent = typeof type !== 'string';

  // For components with children, check for slots FIRST before resolving children
  // Slot children will be rendered inside slot functions with proper context
  if (isComponent && node.children) {
    const slots = resolveSlots(node.children, context);
    if (slots) {
      return h(type, props, slots);
    }
  }

  // Only resolve children if not a slot scenario
  const children = resolveNodeChildren(node.children, node.directives, context);

  if (isComponent && children) {
    return h(type, props, () => children);
  }

  return h(type, props, children);
}

function resolveSlots(
  children: VNodeChildren,
  context: RenderContext
): Record<string, (props: Record<string, unknown>) => VNode | VNode[]> | null {
  if (!Array.isArray(children)) return null;

  const slots: Record<string, (props: Record<string, unknown>) => VNode | VNode[]> = {};
  let hasSlots = false;

  for (const child of children) {
    if (typeof child !== 'object' || child === null) continue;
    if (!('type' in child)) continue;

    const childDef = child as VNodeDefinition;
    if (!childDef.directives?.vSlot) continue;

    const slotInfo = applyVSlot(childDef.directives.vSlot, context);
    if (!slotInfo) continue;

    hasSlots = true;
    const slotName = slotInfo.name || 'default';

    slots[slotName] = (slotProps: Record<string, unknown>) => {
      const props = slotProps || {};
      const slotState: Record<string, { value: unknown }> = {};
      const slotStateTypes: Record<string, 'ref'> = {};
      
      for (const [key, value] of Object.entries(props)) {
        slotState[key] = { value };
        slotStateTypes[key] = 'ref';
      }
      
      const slotContext: RenderContext = {
        ...context,
        state: {
          ...context.state,
          ...slotState,
        },
        stateTypes: {
          ...context.stateTypes,
          ...slotStateTypes,
        },
      };
      const rendered = renderVNodeDefinition(childDef, slotContext);
      return rendered || [];
    };
  }

  return hasSlots ? slots : null;
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

  if (isExpressionParseData(children)) {
    return String(evaluateExpression(children.expression as string | AbstractReferenceParseData | AbstractScopeParseData, context));
  }

  if (Array.isArray(children)) {
    const mapped = children
      .map((child) => {
        if (typeof child === 'string' || typeof child === 'number') {
          return child;
        }
        if (isExpressionParseData(child)) {
          return evaluateExpression(child.expression as string | AbstractReferenceParseData | AbstractScopeParseData, context);
        }
        if (typeof child === 'object' && child !== null) {
          if ('_type' in child) {
            const childRecord = child as unknown as Record<string, unknown>;
            if (childRecord._type === 'expression') {
              const expr = childRecord.expression;
              if (typeof expr === 'string' || typeof expr === 'object') {
                return evaluateExpression(expr as string | AbstractReferenceParseData | AbstractScopeParseData, context);
              }
            }
          }
          if ('type' in child) {
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
