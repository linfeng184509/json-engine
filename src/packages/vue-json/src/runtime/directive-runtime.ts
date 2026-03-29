import { h, createVNode, Fragment, type VNode } from 'vue';
import type {
  VNodeDefinition,
  RenderContext,
  ExpressionValue,
  StateRef,
  PropsRef,
} from '../types';
import { createDirectiveError } from '../utils/error';
import {
  resolvePropertyValue,
  evaluateExpression,
  executeFunction,
  isExpressionValue,
  isStateRef,
  isPropsRef,
} from './value-resolver';

export function applyVIf(condition: ExpressionValue, context: RenderContext): boolean {
  try {
    const result = evaluateExpression(condition.expression, context);
    return Boolean(result);
  } catch (error) {
    throw createDirectiveError(
      'v-if',
      `Failed to evaluate condition: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function applyVShow(vnode: VNode, condition: ExpressionValue, context: RenderContext): VNode {
  try {
    const result = evaluateExpression(condition.expression, context);
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
    const source = evaluateExpression(vFor.source.expression, context);
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
      props[key] = resolvePropertyValue(value, context);
    }
  }

  let children: string | number | VNode | undefined = undefined;
  if (node.children) {
    if (typeof node.children === 'string' || typeof node.children === 'number') {
      children = String(node.children);
    } else if (Array.isArray(node.children)) {
      const mapped = node.children
        .map((child) => {
          if (typeof child === 'string' || typeof child === 'number') {
            return child;
          }
          if (typeof child === 'object' && child !== null && 'type' in child) {
            if (isExpressionValue(child)) {
              return evaluateExpression(child.expression, context);
            }
            return renderVNodeDefinition(child as VNodeDefinition, context);
          }
          return child;
        })
        .filter((child) => child !== null) as (string | number | VNode)[];
      children = mapped.length > 0 ? createVNode(Fragment, null, mapped) : undefined;
    } else if (typeof node.children === 'object' && 'type' in node.children) {
      if (isExpressionValue(node.children)) {
        children = String(evaluateExpression(node.children.expression, context));
      } else {
        children = renderVNodeDefinition(node.children as VNodeDefinition, context) ?? undefined;
      }
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
    const propRef = vModel.prop;
    let value: unknown;

    if (isStateRef(propRef)) {
      const stateValue = context.state[propRef.variable];
      value = stateValue && typeof stateValue === 'object' && 'value' in stateValue
        ? (stateValue as { value: unknown }).value
        : stateValue;
    } else if (isPropsRef(propRef)) {
      value = context.props[propRef.variable];
    } else {
      throw createDirectiveError('v-model', 'vModel.prop must be a StateRef or PropsRef');
    }

    result[prop] = value;

    const event = `update:${prop}`;
    result[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = (newValue: unknown) => {
      setReferenceValue(propRef, newValue, context);
    };

    return result;
  } catch (error) {
    throw createDirectiveError(
      'v-model',
      `Failed to bind: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function setReferenceValue(ref: StateRef | PropsRef, value: unknown, context: RenderContext): void {
  if (isStateRef(ref)) {
    const stateValue = context.state[ref.variable];
    if (stateValue && typeof stateValue === 'object' && 'value' in stateValue) {
      (stateValue as { value: unknown }).value = value;
    }
  } else if (isPropsRef(ref)) {
    context.props[ref.variable] = value;
  }
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

      executeFunction(handler, context, [$event]);
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
      result[key] = evaluateExpression(expression.expression, context);
    } catch (error) {
      throw createDirectiveError(
        'v-bind',
        `Failed to bind "${key}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return result;
}

export function applyVHtml(expression: ExpressionValue, context: RenderContext): string {
  try {
    const result = evaluateExpression(expression.expression, context);
    return String(result ?? '');
  } catch (error) {
    throw createDirectiveError(
      'v-html',
      `Failed to evaluate: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function applyVText(expression: ExpressionValue, context: RenderContext): string {
  try {
    const result = evaluateExpression(expression.expression, context);
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
