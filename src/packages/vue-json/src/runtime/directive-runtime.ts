import { h, type VNode } from 'vue';
import type {
  VNodeDefinition,
  RenderContext,
  ExpressionValue,
  StateRef,
  PropsRef,
} from '../types';
import { createDirectiveError } from '../utils/error';
import {
  evaluateExpression,
  executeFunction,
  isStateReference,
  isPropsReference,
} from './value-resolver';

function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || !path) return obj;

  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === 'object') {
      result = (result as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return result;
}

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

export interface VForResult {
  definition: VNodeDefinition;
  context: RenderContext;
}

export function applyVFor(
  node: VNodeDefinition,
  vFor: NonNullable<VNodeDefinition['directives']>['vFor'],
  context: RenderContext
): VForResult[] {
  if (!vFor) return [];

  try {
    const rawSource = evaluateExpression(vFor.source.expression, context);
    let source = rawSource;
    if (rawSource && typeof rawSource === 'object' && !Array.isArray(rawSource)) {
      const unwrapped = (rawSource as Record<string, unknown>).value;
      if (unwrapped !== undefined) {
        source = unwrapped;
      }
    }
    const items = Array.isArray(source)
      ? source
      : typeof source === 'object' && source !== null
        ? Object.entries(source)
        : [];

    const results: VForResult[] = [];

    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      const index = i;

      if (item && typeof item === 'object' && 'value' in item) {
        item = (item as { value: unknown }).value;
      }

      const extendedContext: RenderContext = {
        ...context,
        state: {
          ...context.state,
          [vFor.alias]: item,
          ...(vFor.index ? { [vFor.index]: index } : {}),
        },
      };

      const newNode = { ...node, directives: { ...node.directives, vFor: undefined } };
      results.push({ definition: newNode, context: extendedContext });
    }

    return results;
  } catch (error) {
    throw createDirectiveError(
      'v-for',
      `Failed to iterate: ${error instanceof Error ? error.message : String(error)}`
    );
  }
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

    if (isStateReference(propRef)) {
      const stateValue = context.state[propRef.variable];
      const stateType = context.stateTypes?.[propRef.variable];
      const needsValue = stateType === 'ref' || stateType === 'shallowRef' || stateType === undefined;
      
      if (needsValue) {
        value = stateValue && typeof stateValue === 'object' && 'value' in stateValue
          ? (stateValue as { value: unknown }).value
          : stateValue;
      } else {
        value = stateValue;
      }
      
      if (propRef.path) {
        value = getNestedValue(value, propRef.path);
      }
    } else if (isPropsReference(propRef)) {
      value = context.props[propRef.variable];
    } else {
      throw createDirectiveError('v-model', 'vModel.prop must be a StateRef or PropsRef');
    }

    result[prop] = value;

    result.onInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      setReferenceValue(propRef, target.value, context);
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
  if (isStateReference(ref)) {
    const stateValue = context.state[ref.variable];
    const stateType = context.stateTypes?.[ref.variable];
    const needsValue = stateType === 'ref' || stateType === 'shallowRef' || stateType === undefined;
    
    if (ref.path) {
      const parentPath = ref.path.split('.');
      const lastKey = parentPath.pop();
      let target: Record<string, unknown> = needsValue 
        ? (stateValue as { value: unknown }).value as Record<string, unknown>
        : stateValue as Record<string, unknown>;
      
      for (const key of parentPath) {
        target = target[key] as Record<string, unknown>;
      }
      if (lastKey) {
        target[lastKey] = value;
      }
    } else if (needsValue && stateValue && typeof stateValue === 'object' && 'value' in stateValue) {
      (stateValue as { value: unknown }).value = value;
    } else {
      Object.assign(stateValue as object, value);
    }
  } else if (isPropsReference(ref)) {
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

export interface VSlotProps {
  name?: string;
  props?: Record<string, unknown>;
}

export function applyVSlot(
  vSlot: NonNullable<VNodeDefinition['directives']>['vSlot'],
  context: RenderContext
): VSlotProps | null {
  if (!vSlot) return null;

  const result: VSlotProps = {};

  if (vSlot.name) {
    try {
      const slotName = evaluateExpression(vSlot.name.expression, context);
      result.name = String(slotName ?? 'default');
    } catch {
      result.name = 'default';
    }
  } else {
    result.name = 'default';
  }

  if (vSlot.props && Array.isArray(vSlot.props)) {
    result.props = {};
    for (const propKey of vSlot.props) {
      if (propKey in context.state) {
        result.props[propKey] = context.state[propKey];
      }
    }
  }

  return result;
}
