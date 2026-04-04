import { createValidationError } from '../utils/error';
export function parseComponents(definition, context) {
    const result = {};
    for (const [componentName, componentDef] of Object.entries(definition)) {
        try {
            if (typeof componentDef !== 'object' || componentDef === null) {
                throw createValidationError(`components.${componentName}`, 'Component definition must be an object', 'object', componentDef);
            }
            const def = componentDef;
            if (!def.type || !['local', 'async'].includes(def.type)) {
                throw createValidationError(`components.${componentName}.type`, 'Component type must be "local" or "async"');
            }
            if (!def.source || typeof def.source !== 'string') {
                throw createValidationError(`components.${componentName}.source`, 'Component must have a "source" string');
            }
            // For now, we store the definition; actual component resolution happens at runtime
            // This allows for dynamic component loading
            result[componentName] = def;
        }
        catch (error) {
            context.errors.push({
                path: `components.${componentName}`,
                message: error instanceof Error ? error.message : String(error),
                value: componentDef,
            });
        }
    }
    return Object.keys(result).length > 0 ? result : undefined;
}
//# sourceMappingURL=components-parser.js.map