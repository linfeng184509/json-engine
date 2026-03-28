import { h, createVNode, Fragment, type VNode } from 'vue';
import type { VNodeDefinition, RenderContext } from '../types';
import { evaluateExpression } from '../utils/expression';
import { createDirectiveError } from '../utils/error';

export function applyVIf(condition: string, context: RenderContext): boolean {
  try {
    const result = evaluateExpression(condition, context);
    return Boolean(result);
  } catch (error) {
    throw createDirectiveError(
      'v-if',
      `Failed to evaluate condition: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function applyVShow(vnode: VNode, condition: string, context: RenderContext): VNode {
  try {
    const result = evaluateExpression(condition, context);
    if (!result) {
      const existingStyle = vnode.props?.style;
      const newStyle =
        typeof existingStyle === 'object' && existingStyle !== null
          ? { ...existingStyle, display: 'none' }
          : { display: 'none' };
      return {
        ...vnode,
        props: {
          ...vnode.props,
          style: newStyle,
        },
      } as VNode;
    }
    return vnode;
  } catch (error) {
    throw createDirectiveError(
      'v-show',
      `Failed to evaluate condition: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function applyVFor(
  node: VNodeDefinition,
  vFor: NonNullable<VNodeDefinition['directives']>['vFor'],
  context: RenderContext
): VNode[] {
  if (!vFor) return [];

  try {
    const source = evaluateExpression(vFor.source, context);
    const items = Array.isArray(source)
      ? source
      : typeof source === 'object' && source !== null
        ? Object.entries(source)
        : [];

    const nodes: VNode[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const index = i;

      const extendedContext: RenderContext = {
        ...context,
        state: {
          ...context.state,
          [vFor.alias]: { value: Array.isArray(source) ? item : item[1] },
          ...(vFor.index ? { [vFor.index]: { value: Array.isArray(source) ? index : item[0] } } : {}),
        },
      };

      const newNode = { ...node, directives: { ...node.directives, vFor: undefined } };
      const childNode = renderVNodeDefinition(newNode, extendedContext);
      if (childNode) {
        nodes.push(childNode);
      }
    }

    return nodes;
  } catch (error) {
    throw createDirectiveError(
      'v-for',
      `Failed to iterate: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function renderVNodeDefinition(node: VNodeDefinition, context: RenderContext): VNode | null {
  const type = node.type;
  const props: Record<string, unknown> = {};

  if (node.props) {
    for (const [key, value] of Object.entries(node.props)) {
      if (typeof value === 'string') {
        props[key] = evaluateExpression(value, context);
      } else {
        props[key] = value;
      }
    }
  }

  let children: string | number | VNode | undefined = undefined;
  if (node.children) {
    if (typeof node.children === 'string') {
      if (node.children.startsWith('{{') && node.children.endsWith('}}')) {
        children = String(evaluateExpression(node.children.slice(2, -2).trim(), context));
      } else {
        children = node.children;
      }
    } else if (Array.isArray(node.children)) {
      const mapped = node.children
        .map((child) => {
          if (typeof child === 'string') {
            if (child.startsWith('{{') && child.endsWith('}}')) {
              return evaluateExpression(child.slice(2, -2).trim(), context);
            }
            return child;
          }
          if (typeof child === 'object' && child !== null && 'type' in child) {
            return renderVNodeDefinition(child as VNodeDefinition, context);
          }
          return child;
        })
        .filter((child) => child !== null) as (string | number | VNode)[];
      children = mapped.length > 0 ? createVNode(Fragment, null, mapped) : undefined;
    }
  }

  return h(type, Object.keys(props).length > 0 ? props : null, children);
}

export function applyVModel(
  vModel: NonNullable<VNodeDefinition['directives']>['vModel'],
  context: RenderContext
): Record<string, unknown> {
  if (!vModel) return {};

  const result: Record<string, unknown> = {};
  const prop = vModel.event || 'modelValue';

  try {
    const value = evaluateExpression(vModel.prop, context);
    result[prop] = value;

    const event = `update:${prop}`;
    result[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = (newValue: unknown) => {
      setExpressionValue(vModel.prop, newValue, context);
    };

    return result;
  } catch (error) {
    throw createDirectiveError(
      'v-model',
      `Failed to bind: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function setExpressionValue(expression: string, value: unknown, context: RenderContext): void {
  const pathParts = expression.split('.').filter((part) => part.length > 0);
  
  if (pathParts.length === 0) return;
  
  const rootKey = pathParts[0];
  const rootValue = context[rootKey as keyof RenderContext];
  
  if (!rootValue) return;
  
  let target: unknown = rootValue;
  const remainingParts = pathParts.slice(1);
  
  if (remainingParts.length === 0) {
    if (rootKey === 'state' && typeof rootValue === 'object' && rootValue !== null) {
      throw createDirectiveError('v-model', 'Cannot directly assign to state object');
    }
    return;
  }
  
  for (let i = 0; i < remainingParts.length - 1; i++) {
    const part = remainingParts[i];
    if (typeof target === 'object' && target !== null) {
      if (isRefLike(target)) {
        target = (target as { value: unknown }).value;
      }
      target = (target as Record<string, unknown>)[part];
    } else {
      return;
    }
  }
  
  const finalKey = remainingParts[remainingParts.length - 1];
  
  if (typeof target === 'object' && target !== null) {
    if (isRefLike(target) && finalKey === 'value') {
      (target as { value: unknown }).value = value;
    } else {
      (target as Record<string, unknown>)[finalKey] = value;
    }
  }
}

function isRefLike(obj: unknown): boolean {
  return typeof obj === 'object' && obj !== null && 'value' in obj && '__v_isRef' in obj;
}

export function applyVOn(
  vOn: NonNullable<VNodeDefinition['directives']>['vOn'],
  context: RenderContext
): Record<string, unknown> {
  if (!vOn) return {};

  const result: Record<string, unknown> = {};

  for (const [event, handler] of Object.entries(vOn)) {
    let eventName = event;
    const modifiers: string[] = [];

    if (event.includes('.')) {
      const parts = event.split('.');
      eventName = parts[0];
      modifiers.push(...parts.slice(1));
    }

    const handlerKey = `on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`;

    result[handlerKey] = ($event: Event) => {
      if (modifiers.includes('prevent')) {
        $event.preventDefault();
      }
      if (modifiers.includes('stop')) {
        $event.stopPropagation();
      }

      const fn = new Function(
        'props',
        'state',
        'computed',
        'methods',
        'emit',
        'event',
        'slots',
        'attrs',
        'provide',
        `"use strict"; ${handler}`
      );
      fn(
        context.props,
        context.state,
        context.computed,
        context.methods,
        context.emit,
        $event,
        context.slots,
        context.attrs,
        context.provide
      );
    };
  }

  return result;
}

export function applyVBind(
  vBind: NonNullable<VNodeDefinition['directives']>['vBind'],
  context: RenderContext
): Record<string, unknown> {
  if (!vBind) return {};

  const result: Record<string, unknown> = {};

  for (const [key, expression] of Object.entries(vBind)) {
    try {
      result[key] = evaluateExpression(expression, context);
    } catch (error) {
      throw createDirectiveError(
        'v-bind',
        `Failed to bind "${key}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return result;
}

export function applyVHtml(expression: string, context: RenderContext): string {
  try {
    const result = evaluateExpression(expression, context);
    return String(result ?? '');
  } catch (error) {
    throw createDirectiveError(
      'v-html',
      `Failed to evaluate: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function applyVText(expression: string, context: RenderContext): string {
  try {
    const result = evaluateExpression(expression, context);
    return String(result ?? '');
  } catch (error) {
    throw createDirectiveError(
      'v-text',
      `Failed to evaluate: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function applyVOnce(
  type: string,
  props: Record<string, unknown> | null,
  children: string | number | VNode | undefined
): VNode {
  return h(type, props, children);
}