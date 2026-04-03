import { isFunctionParseData } from '@json-engine/core-engine';
import { createValidationError } from '../utils/error';
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
export function parseMethods(definition, context) {
    const result = {};
    for (const [methodName, methodValue] of Object.entries(definition)) {
        try {
            const fn = validateFunctionValue(methodValue, `methods.${methodName}`);
            result[methodName] = fn;
        }
        catch (error) {
            context.errors.push({
                path: `methods.${methodName}`,
                message: error instanceof Error ? error.message : String(error),
                value: methodValue,
            });
        }
    }
    return result;
}
//# sourceMappingURL=methods-parser.js.map