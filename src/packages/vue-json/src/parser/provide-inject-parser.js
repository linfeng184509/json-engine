import { createValidationError } from '../utils/error';
export function parseProvide(definition, context) {
    const result = { items: [] };
    try {
        if (!Array.isArray(definition.items)) {
            throw createValidationError('provide.items', 'Provide items must be an array', 'array', definition.items);
        }
        for (let i = 0; i < definition.items.length; i++) {
            const item = definition.items[i];
            if (!item.key || typeof item.key !== 'string') {
                context.errors.push({
                    path: `provide.items[${i}].key`,
                    message: 'Provide item must have a "key" string',
                    value: item,
                });
                continue;
            }
            result.items.push({
                key: item.key,
                value: item.value || item.key,
            });
        }
    }
    catch (error) {
        context.errors.push({
            path: 'provide',
            message: error instanceof Error ? error.message : String(error),
            value: definition,
        });
    }
    return result;
}
export function parseInject(definition, context) {
    const result = { items: [] };
    try {
        if (!Array.isArray(definition.items)) {
            throw createValidationError('inject.items', 'Inject items must be an array', 'array', definition.items);
        }
        for (let i = 0; i < definition.items.length; i++) {
            const item = definition.items[i];
            if (!item.key || typeof item.key !== 'string') {
                context.errors.push({
                    path: `inject.items[${i}].key`,
                    message: 'Inject item must have a "key" string',
                    value: item,
                });
                continue;
            }
            result.items.push({
                key: item.key,
                default: item.default,
                from: item.from,
            });
        }
    }
    catch (error) {
        context.errors.push({
            path: 'inject',
            message: error instanceof Error ? error.message : String(error),
            value: definition,
        });
    }
    return result;
}
//# sourceMappingURL=provide-inject-parser.js.map