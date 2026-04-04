import { validateFunctionValue } from '../utils/validate-function';
import { createValidationError } from '../utils/error';
export function parseComputed(definition, context) {
    const result = {};
    for (const [computedName, computedDef] of Object.entries(definition)) {
        try {
            if (typeof computedDef !== 'object' || computedDef === null) {
                throw createValidationError(`computed.${computedName}`, 'Computed definition must be an object', 'object', computedDef);
            }
            const def = computedDef;
            if (!def.get) {
                throw createValidationError(`computed.${computedName}.get`, 'Computed must have a "get" FunctionValue');
            }
            const getFn = validateFunctionValue(def.get, `computed.${computedName}.get`);
            result[computedName] = {
                get: getFn,
                set: def.set ? validateFunctionValue(def.set, `computed.${computedName}.set`) : undefined,
            };
        }
        catch (error) {
            context.errors.push({
                path: `computed.${computedName}`,
                message: error instanceof Error ? error.message : String(error),
                value: computedDef,
            });
        }
    }
    return result;
}
//# sourceMappingURL=computed-parser.js.map