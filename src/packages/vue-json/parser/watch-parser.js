import { isExpressionParseData, isFunctionParseData } from '@json-engine/core-engine';
import { createValidationError } from '../utils/error';
function validateExpressionValue(expr, path) {
    if (!isExpressionParseData(expr)) {
        throw createValidationError(path, 'Must be an ExpressionValue with _type="expression"', '{ _type: "expression", expression: "..." }', expr);
    }
    return expr;
}
function validateFunctionValue(fn, path) {
    if (!isFunctionParseData(fn)) {
        throw createValidationError(path, 'Must be a FunctionValue with _type="function"', '{ _type: "function", params: {}, body: "..." }', fn);
    }
    if (typeof fn.body !== 'string') {
        throw createValidationError(`${path}.body`, 'FunctionValue.body must be a string', 'string', fn.body);
    }
    if (typeof fn.params !== 'object' || fn.params === null) {
        throw createValidationError(`${path}.params`, 'FunctionValue.params must be an object', 'object', fn.params);
    }
    return fn;
}
export function parseWatch(definition, context) {
    const result = {};
    for (const [watchName, watchDef] of Object.entries(definition)) {
        try {
            if (typeof watchDef !== 'object' || watchDef === null) {
                throw createValidationError(`watch.${watchName}`, 'Watch definition must be an object', 'object', watchDef);
            }
            const def = watchDef;
            if (!def.source) {
                throw createValidationError(`watch.${watchName}.source`, 'Watch must have a "source" ExpressionValue');
            }
            const source = validateExpressionValue(def.source, `watch.${watchName}.source`);
            if (!def.handler) {
                throw createValidationError(`watch.${watchName}.handler`, 'Watch must have a "handler" FunctionValue');
            }
            const handler = validateFunctionValue(def.handler, `watch.${watchName}.handler`);
            result[watchName] = {
                source,
                handler,
                immediate: def.immediate,
                deep: def.deep,
                flush: def.flush,
                type: def.type || 'watch',
            };
        }
        catch (error) {
            context.errors.push({
                path: `watch.${watchName}`,
                message: error instanceof Error ? error.message : String(error),
                value: watchDef,
            });
        }
    }
    return result;
}
//# sourceMappingURL=watch-parser.js.map