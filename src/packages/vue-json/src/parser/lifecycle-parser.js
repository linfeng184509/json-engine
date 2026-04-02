import { isFunctionParseData } from '@json-engine/core-engine';
import { createValidationError } from '../utils/error';
const LIFECYCLE_HOOKS = [
    'onMounted',
    'onUnmounted',
    'onUpdated',
    'onBeforeMount',
    'onBeforeUnmount',
    'onBeforeUpdate',
    'onErrorCaptured',
    'onActivated',
    'onDeactivated',
];
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
function isFunctionValue(value) {
    return isFunctionParseData(value);
}
function parseHookValue(value, path) {
    if (!value)
        return undefined;
    if (isFunctionValue(value)) {
        return [validateFunctionValue(value, path)];
    }
    if (Array.isArray(value)) {
        return value.map((v, i) => validateFunctionValue(v, `${path}[${i}]`));
    }
    return undefined;
}
export function parseLifecycle(definition, context) {
    const result = {};
    for (const hookName of LIFECYCLE_HOOKS) {
        const hookValue = definition[hookName];
        try {
            if (hookValue !== undefined) {
                const parsed = parseHookValue(hookValue, `lifecycle.${hookName}`);
                if (parsed && parsed.length > 0) {
                    result[hookName] = parsed.length === 1 ? parsed[0] : parsed;
                }
            }
        }
        catch (error) {
            context.errors.push({
                path: `lifecycle.${hookName}`,
                message: error instanceof Error ? error.message : String(error),
                value: hookValue,
            });
        }
    }
    return result;
}
//# sourceMappingURL=lifecycle-parser.js.map