import { validateFunctionValue } from '../utils/validate-function';
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