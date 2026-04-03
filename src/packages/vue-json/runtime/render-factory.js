import { h, Fragment, ref } from 'vue';
import { DirectiveError } from '../utils/error';
import { applyVIf, applyVShow, applyVFor, applyVModel, applyVOn, applyVBind, applyVHtml, applyVText, applyVSlot, } from './directive-runtime';
import { resolvePropertyValue, evaluateExpression, isExpressionParseData } from './value-resolver';
import { createStateProxy } from './state-factory';
export function renderVNode(definition, context) {
    if (definition.type === 'function') {
        return renderFunction(definition.content, context);
    }
    return renderTemplate(definition.content, context);
}
function renderFunction(fnValue, context) {
    try {
        const fn = new Function('h', 'props', 'state', 'computed', 'methods', 'emit', 'slots', 'attrs', 'provide', `"use strict"; ${fnValue.body}`);
        const result = fn(h, context.props, context.state, context.computed, context.methods, context.emit, context.slots, context.attrs, context.provide);
        return result;
    }
    catch (error) {
        throw new DirectiveError('render-function', `Failed to render: ${error instanceof Error ? error.message : String(error)}`);
    }
}
function renderTemplate(node, context) {
    return renderVNodeDefinition(node, context);
}
function renderVNodeDefinition(node, context) {
    if (node.directives) {
        if (node.directives.vIf !== undefined) {
            const result = applyVIf(node.directives.vIf, context);
            if (!result)
                return null;
        }
        if (node.directives.vShow !== undefined) {
            const vnode = renderVNodeDefinition({ ...node, directives: undefined }, context);
            if (!vnode)
                return null;
            return applyVShow(vnode, node.directives.vShow, context);
        }
        if (node.directives.vFor) {
            const results = applyVFor(node, node.directives.vFor, context);
            const vnodes = results
                .map((result) => renderVNodeDefinition(result.definition, result.context))
                .filter((vn) => vn !== null);
            return vnodes.length > 0 ? vnodes[0] : null;
        }
    }
    // Handle template elements: render children directly instead of the template element
    if (node.type === 'template') {
        const children = resolveNodeChildren(node.children, node.directives, context);
        if (Array.isArray(children)) {
            return children.length === 1 ? children[0] : h(Fragment, children);
        }
        if (children) {
            return children;
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
function resolveSlots(children, context) {
    if (!Array.isArray(children))
        return null;
    const slots = {};
    let hasSlots = false;
    for (const child of children) {
        if (typeof child !== 'object' || child === null)
            continue;
        if (!('type' in child))
            continue;
        const childDef = child;
        if (!childDef.directives?.vSlot)
            continue;
        const slotInfo = applyVSlot(childDef.directives.vSlot, context);
        if (!slotInfo)
            continue;
        hasSlots = true;
        const slotName = slotInfo.name || 'default';
        slots[slotName] = (slotProps) => {
            const props = slotProps || {};
            const slotState = {};
            for (const [key, value] of Object.entries(props)) {
                slotState[key] = ref(value);
            }
            const mergedState = {
                ...context.state,
                ...slotState,
            };
            const slotContext = {
                ...context,
                state: createStateProxy(mergedState),
            };
            const rendered = renderVNodeDefinition(childDef, slotContext);
            return rendered || [];
        };
    }
    return hasSlots ? slots : null;
}
function resolveNodeType(type, context) {
    if (context.components[type]) {
        return context.components[type];
    }
    return type;
}
function resolveNodeProps(props, directives, context) {
    const result = {};
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
function resolveNodeChildren(children, directives, context) {
    const proxiedContext = {
        ...context,
        state: createStateProxy(context.state),
    };
    if (directives?.vHtml !== undefined) {
        return applyVHtml(directives.vHtml, proxiedContext);
    }
    if (directives?.vText !== undefined) {
        return applyVText(directives.vText, proxiedContext);
    }
    if (!children)
        return undefined;
    if (typeof children === 'string') {
        return children;
    }
    if (typeof children === 'number') {
        return children;
    }
    if (isExpressionParseData(children)) {
        return String(evaluateExpression(children.expression, proxiedContext));
    }
    if (Array.isArray(children)) {
        const mapped = children
            .map((child) => {
            if (typeof child === 'string' || typeof child === 'number') {
                return child;
            }
            if (isExpressionParseData(child)) {
                return evaluateExpression(child.expression, proxiedContext);
            }
            if (typeof child === 'object' && child !== null) {
                if ('_type' in child) {
                    const childRecord = child;
                    if (childRecord._type === 'expression') {
                        const expr = childRecord.expression;
                        if (typeof expr === 'string' || typeof expr === 'object') {
                            return evaluateExpression(expr, proxiedContext);
                        }
                    }
                }
                if ('type' in child) {
                    return renderVNodeDefinition(child, proxiedContext);
                }
            }
            return child;
        })
            .filter((child) => child !== null);
        return mapped.length > 0 ? mapped : undefined;
    }
    if (typeof children === 'object' && 'type' in children) {
        return renderVNodeDefinition(children, context) ?? undefined;
    }
    return undefined;
}
//# sourceMappingURL=render-factory.js.map