import { isExpressionParseData, isFunctionParseData, isReferenceParseData } from '@json-engine/core-engine';
import { createValidationError } from '../utils/error';
import { validateFunctionValue } from '../utils/validate-function';
function normalizeRefToReference(value) {
    if (typeof value === 'object' && value !== null && '$ref' in value) {
        const refStr = value['$ref'];
        const parts = refStr.split('.');
        if (parts.length >= 2) {
            const prefix = parts[0];
            const variable = parts[1];
            const path = parts.slice(2).join('.') || undefined;
            return { _type: 'reference', prefix, variable, ...(path ? { path } : {}) };
        }
    }
    return value;
}
function isPropertyValue(value) {
    if (value === null || value === undefined)
        return true;
    if (typeof value !== 'object')
        return true;
    const obj = value;
    if (typeof obj._type === 'string') {
        return ['expression', 'reference', 'scope', 'string', 'function', 'echarts-option'].includes(obj._type);
    }
    return true;
}
function validatePropertyValue(value, path) {
    if (!isPropertyValue(value)) {
        throw createValidationError(path, 'Must be a literal or structured value (ExpressionValue, ReferenceParseData)', 'PropertyValue', value);
    }
}
function validateVNodeChild(child, path, context) {
    if (typeof child === 'string' || typeof child === 'number') {
        return;
    }
    if (typeof child === 'object' && child !== null) {
        if ('type' in child) {
            if (child.type === 'expression') {
                validatePropertyValue(child, path);
            }
            else if (typeof child.type === 'string') {
                validateVNode(child, path, context);
            }
        }
    }
}
function validateVNodeChildren(children, path, context) {
    if (Array.isArray(children)) {
        children.forEach((child, index) => {
            validateVNodeChild(child, `${path}[${index}]`, context);
        });
    }
    else {
        validateVNodeChild(children, path, context);
    }
}
function validateVNodeDirectives(directives, path, context) {
    if (directives.vIf !== undefined) {
        if (!isExpressionParseData(directives.vIf)) {
            context.errors.push({
                path: `${path}.vIf`,
                message: 'vIf must be an ExpressionValue',
                value: directives.vIf,
                expectedType: 'ExpressionValue',
                actualType: typeof directives.vIf,
            });
        }
    }
    if (directives.vElseIf !== undefined) {
        if (!isExpressionParseData(directives.vElseIf)) {
            context.errors.push({
                path: `${path}.vElseIf`,
                message: 'vElseIf must be an ExpressionValue',
                value: directives.vElseIf,
                expectedType: 'ExpressionValue',
                actualType: typeof directives.vElseIf,
            });
        }
    }
    if (directives.vShow !== undefined) {
        if (!isExpressionParseData(directives.vShow)) {
            context.errors.push({
                path: `${path}.vShow`,
                message: 'vShow must be an ExpressionValue',
                value: directives.vShow,
                expectedType: 'ExpressionValue',
                actualType: typeof directives.vShow,
            });
        }
    }
    if (directives.vFor) {
        if (!isExpressionParseData(directives.vFor.source)) {
            context.errors.push({
                path: `${path}.vFor.source`,
                message: 'vFor.source must be an ExpressionValue',
                value: directives.vFor.source,
                expectedType: 'ExpressionValue',
                actualType: typeof directives.vFor.source,
            });
        }
        if (typeof directives.vFor.alias !== 'string') {
            context.errors.push({
                path: `${path}.vFor.alias`,
                message: 'vFor.alias must be a string',
                value: directives.vFor.alias,
                expectedType: 'string',
                actualType: typeof directives.vFor.alias,
            });
        }
    }
    if (directives.vModel) {
        const vModel = directives.vModel;
        if (Array.isArray(vModel)) {
            for (let i = 0; i < vModel.length; i++) {
                const item = vModel[i];
                if (item && item.prop) {
                    item.prop = normalizeRefToReference(item.prop);
                    if (!isReferenceParseData(item.prop)) {
                        context.errors.push({
                            path: `${path}.vModel[${i}].prop`,
                            message: 'vModel.prop must be a ReferenceParseData (state or props reference)',
                            value: item.prop,
                            expectedType: 'ReferenceParseData',
                            actualType: typeof item.prop,
                        });
                    }
                }
            }
        }
        else {
            const normalizedProp = normalizeRefToReference(vModel.prop);
            vModel.prop = normalizedProp;
            if (!isReferenceParseData(vModel.prop)) {
                context.errors.push({
                    path: `${path}.vModel.prop`,
                    message: 'vModel.prop must be a ReferenceParseData (state or props reference)',
                    value: vModel.prop,
                    expectedType: 'ReferenceParseData',
                    actualType: typeof vModel.prop,
                });
            }
        }
    }
    if (directives.vOn) {
        for (const [event, handler] of Object.entries(directives.vOn)) {
            if (!isFunctionParseData(handler)) {
                context.errors.push({
                    path: `${path}.vOn.${event}`,
                    message: 'vOn handler must be a FunctionValue',
                    value: handler,
                    expectedType: 'FunctionValue',
                    actualType: typeof handler,
                });
            }
        }
    }
    if (directives.vBind) {
        for (const [attr, expr] of Object.entries(directives.vBind)) {
            if (!isExpressionParseData(expr)) {
                context.errors.push({
                    path: `${path}.vBind.${attr}`,
                    message: 'vBind value must be an ExpressionValue',
                    value: expr,
                    expectedType: 'ExpressionValue',
                    actualType: typeof expr,
                });
            }
        }
    }
    if (directives.vHtml !== undefined) {
        if (!isExpressionParseData(directives.vHtml)) {
            context.errors.push({
                path: `${path}.vHtml`,
                message: 'vHtml must be an ExpressionValue',
                value: directives.vHtml,
                expectedType: 'ExpressionValue',
                actualType: typeof directives.vHtml,
            });
        }
    }
    if (directives.vText !== undefined) {
        if (!isExpressionParseData(directives.vText)) {
            context.errors.push({
                path: `${path}.vText`,
                message: 'vText must be an ExpressionValue',
                value: directives.vText,
                expectedType: 'ExpressionValue',
                actualType: typeof directives.vText,
            });
        }
    }
}
function validateVNode(node, path, context) {
    if (!node.type || typeof node.type !== 'string') {
        throw createValidationError(`${path}.type`, 'VNode must have a "type" string');
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
export function parseRender(definition, context) {
    try {
        if (typeof definition !== 'object' || definition === null) {
            throw createValidationError('render', 'Render definition must be an object', 'object', definition);
        }
        if (!definition.type || !['template', 'function'].includes(definition.type)) {
            throw createValidationError('render.type', 'Render type must be "template" or "function"', '"template" | "function"', definition.type);
        }
        if (!definition.content) {
            throw createValidationError('render.content', 'Render must have "content"');
        }
        if (definition.type === 'template') {
            const vnode = definition.content;
            validateVNode(vnode, 'render.content', context);
        }
        else if (definition.type === 'function') {
            const fn = definition.content;
            validateFunctionValue(fn, 'render.content');
        }
        return definition;
    }
    catch (error) {
        context.errors.push({
            path: 'render',
            message: error instanceof Error ? error.message : String(error),
            value: definition,
        });
        return definition;
    }
}
//# sourceMappingURL=render-parser.js.map