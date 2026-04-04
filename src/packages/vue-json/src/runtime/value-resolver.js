import { isReferenceParseData, isExpressionParseData, isFunctionParseData, isScopeParseData, } from '@json-engine/core-engine';
import { isRef } from 'vue';
import { getLogger } from '../utils/logger';
import { functionCache } from '../utils/expression';
const logger = getLogger('value-resolver');
function createStateProxyForEvaluation(state) {
    return new Proxy(state, {
        get(target, prop) {
            const value = target[prop];
            if (isRef(value)) {
                return value.value;
            }
            return value;
        },
        set(target, prop, value) {
            const existing = target[prop];
            if (isRef(existing)) {
                existing.value = value;
                return true;
            }
            if (isRef(value)) {
                target[prop] = value;
                return true;
            }
            target[prop] = value;
            return true;
        },
    });
}
export { isReferenceParseData, isExpressionParseData, isFunctionParseData, isScopeParseData, evaluateStringExpression, };
export function isStateReference(value) {
    return isReferenceParseData(value) && value.prefix === 'state';
}
export function isPropsReference(value) {
    return isReferenceParseData(value) && value.prefix === 'props';
}
export function isComputedReference(value) {
    return isReferenceParseData(value) && value.prefix === 'computed';
}
export function isEChartsOption(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    return value._type === 'echarts-option';
}
function getNestedValue(obj, path) {
    if (!obj || !path)
        return obj;
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result && typeof result === 'object') {
            result = result[key];
        }
        else {
            return undefined;
        }
    }
    return result;
}
function resolveExpressionsDeep(value, context) {
    if (value === null || value === undefined) {
        return value;
    }
    if (typeof value === 'string') {
        const match = value.match(/^\{\{(.+)\}\}$/);
        if (match) {
            return evaluateStringExpression(match[1].trim(), context);
        }
        return value;
    }
    if (typeof value !== 'object') {
        return value;
    }
    if (isExpressionParseData(value)) {
        return evaluateExpression(value.expression, context);
    }
    if (typeof value === 'object' && value !== null && '$expr' in value) {
        const exprVal = value['$expr'];
        if (typeof exprVal === 'string') {
            return evaluateStringExpression(exprVal, context);
        }
        return evaluateExpression(exprVal, context);
    }
    if (typeof value === 'object' && value !== null && '$fn' in value) {
        const fnVal = value['$fn'];
        if (typeof fnVal === 'string') {
            return (...args) => {
                const fnContext = { ...context, args };
                return evaluateStringExpression(fnVal, fnContext);
            };
        }
    }
    if (Array.isArray(value)) {
        return value.map(item => resolveExpressionsDeep(item, context));
    }
    const result = {};
    for (const [key, val] of Object.entries(value)) {
        result[key] = resolveExpressionsDeep(val, context);
    }
    return result;
}
export function resolvePropertyValue(value, context) {
    if (value === null || value === undefined) {
        return value;
    }
    if (typeof value !== 'object') {
        return value;
    }
    if (isExpressionParseData(value)) {
        return evaluateExpression(value.expression, context);
    }
    if (typeof value === 'object' && value !== null && '$expr' in value) {
        const exprVal = value['$expr'];
        if (typeof exprVal === 'string') {
            return evaluateStringExpression(exprVal, context);
        }
        return evaluateExpression(exprVal, context);
    }
    if (typeof value === 'object' && value !== null && '$fn' in value) {
        const fnVal = value['$fn'];
        if (typeof fnVal === 'string') {
            return (...args) => {
                const fnContext = { ...context, args };
                return evaluateStringExpression(fnVal, fnContext);
            };
        }
    }
    if (isReferenceParseData(value)) {
        const ref = value;
        if (ref.prefix === 'state') {
            let stateRef = context.state[ref.variable];
            if (stateRef === undefined && context.computed) {
                stateRef = context.computed[ref.variable];
            }
            let stateValue = stateRef;
            if (stateRef && typeof stateRef === 'object' && 'value' in stateRef) {
                stateValue = stateRef.value;
            }
            if (ref.path) {
                return getNestedValue(stateValue, ref.path);
            }
            return stateValue;
        }
        if (ref.prefix === 'props') {
            const propsValue = context.props[ref.variable];
            if (ref.path) {
                return getNestedValue(propsValue, ref.path);
            }
            return propsValue;
        }
        if (ref.prefix === 'computed') {
            const computedRef = context.computed[ref.variable];
            let computedValue = computedRef;
            if (computedRef && typeof computedRef === 'object' && 'value' in computedRef) {
                computedValue = computedRef.value;
            }
            if (ref.path) {
                if (ref.path === 'value') {
                    return computedValue;
                }
                return getNestedValue(computedValue, ref.path);
            }
            return computedValue;
        }
    }
    if (isScopeParseData(value)) {
        const scopeKey = value.scope;
        const contextRecord = context;
        const scopeValue = contextRecord[scopeKey];
        if (scopeValue && typeof scopeValue === 'object') {
            return scopeValue[value.variable];
        }
        return undefined;
    }
    const valueRecord = value;
    if (valueRecord._type === 'echarts-option') {
        return resolveExpressionsDeep(valueRecord.option, context);
    }
    if (valueRecord._type === 'string' && typeof valueRecord.value === 'string') {
        return valueRecord.value;
    }
    if (valueRecord._type === 'object') {
        const objValue = value;
        const result = {};
        for (const [key, val] of Object.entries(objValue.value)) {
            result[key] = resolvePropertyValue(val, context);
        }
        return result;
    }
    if (isFunctionParseData(value)) {
        const fnValue = value;
        return (...args) => executeFunction(fnValue, context, args);
    }
    // Recurse into plain objects to resolve nested $expr/$fn
    if (!valueRecord._type && typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
            return value.map(item => resolvePropertyValue(item, context));
        }
        const result = {};
        for (const [key, val] of Object.entries(value)) {
            result[key] = resolvePropertyValue(val, context);
        }
        return result;
    }
    return value;
}
export function evaluateExpression(expression, context) {
    if (typeof expression === 'string') {
        return evaluateStringExpression(expression, context);
    }
    if (expression._type === 'reference') {
        const ref = expression;
        if (ref.prefix === 'state') {
            let stateRef = context.state[ref.variable];
            if (stateRef === undefined && context.computed) {
                stateRef = context.computed[ref.variable];
            }
            let stateValue = stateRef;
            if (stateRef && typeof stateRef === 'object' && 'value' in stateRef) {
                stateValue = stateRef.value;
            }
            if (ref.path) {
                return getNestedValue(stateValue, ref.path);
            }
            return stateValue;
        }
        if (ref.prefix === 'props') {
            if (ref.path) {
                return getNestedValue(context.props[ref.variable], ref.path);
            }
            return context.props[ref.variable];
        }
        if (ref.prefix === 'computed') {
            const computedRef = context.computed[ref.variable];
            let computedValue = computedRef;
            if (computedRef && typeof computedRef === 'object' && 'value' in computedRef) {
                computedValue = computedRef.value;
            }
            if (ref.path) {
                if (ref.path === 'value') {
                    return computedValue;
                }
                return getNestedValue(computedValue, ref.path);
            }
            return computedValue;
        }
        return undefined;
    }
    if (expression._type === 'scope') {
        const ref = expression;
        const scopeKey = ref.scope;
        const contextRecord = context;
        const scopeValue = contextRecord[scopeKey];
        if (scopeValue && typeof scopeValue === 'object') {
            return scopeValue[ref.variable];
        }
        return undefined;
    }
    return undefined;
}
function evaluateStringExpression(expression, context) {
    const trimmed = expression.trim();
    if (!trimmed) {
        return '';
    }
    const transformed = trimmed
        .replace(/\$state(?=\.|$|\s)/g, 'state')
        .replace(/\$props(?=\.|$|\s)/g, 'props')
        .replace(/\$computed(?=\.|$|\s)/g, 'computed')
        .replace(/\$_core\.(\w+)/g, 'coreScope._$1')
        .replace(/\$_antd\.(\w+)/g, 'coreScope._antd.$1');
    logger.debug('evaluateStringExpression transformed:', transformed);
    const proxiedState = context.stateProxy || createStateProxyForEvaluation(context.state);
    const proxiedComputed = context.computedProxy || createStateProxyForEvaluation(context.computed);
    try {
        const cachedFn = functionCache.get(transformed);
        const fn = cachedFn || new Function('props', 'state', 'computed', 'methods', 'emit', 'slots', 'attrs', 'provide', 'coreScope', `"use strict"; return (${transformed});`);
        if (!cachedFn) {
            functionCache.set(transformed, fn);
        }
        const result = fn(context.props, proxiedState, proxiedComputed, context.methods, context.emit, context.slots, context.attrs, context.provide, context.coreScope || {});
        return result;
    }
    catch (error) {
        throw new Error(`Failed to evaluate expression "${expression}": ${error instanceof Error ? error.message : String(error)}`);
    }
}
export function transformFunctionBody(body) {
    if (!body)
        return body;
    let result = body;
    if (result.startsWith('{{') && result.endsWith('}}')) {
        result = result.slice(2, -2);
    }
    return result
        .replace(/\$event(?=\b|\s|$)/g, 'args[0]')
        .replace(/\$state(?=\.|$|\s)/g, 'state')
        .replace(/\$props(?=\.|$|\s)/g, 'props')
        .replace(/\$computed(?=\.|$|\s)/g, 'computed')
        .replace(/\$_core\.(\w+)/g, 'coreScope._$1');
}
function parseFunctionParams(params) {
    if (!params)
        return [];
    if (typeof params === 'string') {
        let cleaned = params.trim();
        if (cleaned.startsWith('{{{') && cleaned.endsWith('}}}')) {
            cleaned = cleaned.slice(3, -3).trim();
        }
        if (cleaned.startsWith('{{') && cleaned.endsWith('}}')) {
            cleaned = cleaned.slice(2, -2).trim();
            try {
                const parsed = JSON.parse(cleaned);
                if (typeof parsed === 'object' && parsed !== null) {
                    return Object.keys(parsed);
                }
            }
            catch {
                // Not JSON
            }
        }
        if (!cleaned)
            return [];
        return cleaned.split(',').map(p => p.trim()).filter(p => p);
    }
    if (typeof params === 'object') {
        return Object.keys(params);
    }
    return [];
}
export function executeFunction(fnValue, context, args = []) {
    const transformedBody = transformFunctionBody(fnValue.body);
    const paramNames = parseFunctionParams(fnValue.params);
    const paramBindings = paramNames.length > 0
        ? paramNames.map((name, index) => `var ${name} = args[${index}];`).join(' ')
        : '';
    logger.debug('executeFunction body:', fnValue.body);
    logger.debug('executeFunction transformedBody:', transformedBody);
    try {
        const fn = new Function('props', 'state', 'computed', 'methods', 'emit', 'slots', 'attrs', 'provide', 'args', 'coreScope', `"use strict"; ${paramBindings} ${transformedBody}`);
        logger.debug('executeFunction called with context');
        const proxiedState = context.stateProxy || createStateProxyForEvaluation(context.state);
        const proxiedComputed = context.computedProxy || createStateProxyForEvaluation(context.computed);
        return fn(context.props, proxiedState, proxiedComputed, context.methods, context.emit, context.slots, context.attrs, context.provide, args, context.coreScope || {});
    }
    catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Function execution error', {
            body: fnValue.body.substring(0, 100),
            transformedBody: transformedBody.substring(0, 200),
            params: fnValue.params,
            paramNames,
            argsLength: args.length,
            errorMessage: err.message,
        });
        throw err;
    }
}
//# sourceMappingURL=value-resolver.js.map