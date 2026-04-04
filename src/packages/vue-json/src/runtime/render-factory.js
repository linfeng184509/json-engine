import { h, Fragment, ref } from 'vue';
import { DirectiveError } from '../utils/error';
import { getLogger } from '../utils/logger';
import { applyVIf, applyVShow, applyVFor, applyVModel, applyVOn, applyVBind, applyVHtml, applyVText, applyVSlot, applyVElseIf, } from './directive-runtime';
import { resolvePropertyValue, evaluateExpression, isExpressionParseData } from './value-resolver';
import { createStateProxy } from './state-factory';
const logger = getLogger('render-factory');
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
            logger.debug('v-if condition for %s:', node.type, JSON.stringify(node.directives.vIf));
            try {
                const result = applyVIf(node.directives.vIf, context);
                logger.debug('v-if result for %s:', node.type, result);
                if (!result)
                    return null;
            }
            catch (e) {
                logger.error('v-if error for %s:', node.type, e);
                return null;
            }
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
            return vnodes.length === 1 ? vnodes[0] : vnodes.length > 1 ? h(Fragment, vnodes) : null;
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
    // Check if this component node itself has a vSlot directive
    if (isComponent && node.directives?.vSlot) {
        const slotInfo = applyVSlot(node.directives.vSlot, context);
        if (slotInfo) {
            const slotName = slotInfo.name || 'default';
            const slots = {};
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
                    state: mergedState,
                    stateProxy: undefined,
                    computedProxy: undefined,
                };
                const rendered = resolveNodeChildren(node.children, node.directives, slotContext);
                const vnodes = [];
                if (Array.isArray(rendered)) {
                    for (const r of rendered) {
                        if (typeof r !== 'string' && typeof r !== 'number')
                            vnodes.push(r);
                    }
                }
                else if (rendered && typeof rendered !== 'string' && typeof rendered !== 'number') {
                    vnodes.push(rendered);
                }
                return vnodes;
            };
            return h(type, props, slots);
        }
    }
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
                state: mergedState,
                stateProxy: undefined,
                computedProxy: undefined,
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
    const proxiedContext = context.stateProxy
        ? context
        : {
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
        const mapped = [];
        let conditionalBranchActive = false;
        let conditionalChainActive = false;
        for (const child of children) {
            if (typeof child === 'string' || typeof child === 'number') {
                conditionalChainActive = false;
                mapped.push(child);
                continue;
            }
            if (isExpressionParseData(child)) {
                conditionalChainActive = false;
                const result = evaluateExpression(child.expression, proxiedContext);
                mapped.push(result);
                continue;
            }
            if (typeof child === 'object' && child !== null && 'type' in child) {
                const childDef = child;
                const dirs = childDef.directives;
                const vIfCond = dirs?.vIf;
                const vElseIfCond = dirs?.vElseIf;
                const vElseFlag = dirs?.vElse;
                if (vIfCond !== undefined) {
                    conditionalChainActive = true;
                    conditionalBranchActive = false;
                    const result = applyVIf(vIfCond, proxiedContext);
                    if (result) {
                        conditionalBranchActive = true;
                    }
                    else {
                        continue;
                    }
                }
                else if (vElseIfCond !== undefined && conditionalChainActive) {
                    if (conditionalBranchActive) {
                        continue;
                    }
                    const result = applyVElseIf(vElseIfCond, proxiedContext);
                    if (result) {
                        conditionalBranchActive = true;
                    }
                    else {
                        continue;
                    }
                }
                else if (vElseFlag !== undefined && conditionalChainActive) {
                    if (conditionalBranchActive) {
                        continue;
                    }
                    conditionalChainActive = false;
                }
                else {
                    conditionalChainActive = false;
                }
                const rendered = renderVNodeDefinition(childDef, proxiedContext);
                if (rendered) {
                    mapped.push(rendered);
                }
                continue;
            }
            conditionalChainActive = false;
            if (typeof child === 'object' && child !== null && '_type' in child) {
                const childRecord = child;
                if (childRecord._type === 'expression') {
                    const expr = childRecord.expression;
                    if (typeof expr === 'string' || typeof expr === 'object') {
                        mapped.push(evaluateExpression(expr, proxiedContext));
                    }
                }
            }
        }
        return mapped.length > 0 ? mapped : undefined;
    }
    if (typeof children === 'object' && 'type' in children) {
        return renderVNodeDefinition(children, proxiedContext) ?? undefined;
    }
    return undefined;
}
//# sourceMappingURL=render-factory.js.map