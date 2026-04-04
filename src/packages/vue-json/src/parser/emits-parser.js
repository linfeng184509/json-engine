export function parseEmits(definition, context) {
    const result = [];
    for (const [emitName, emitDef] of Object.entries(definition)) {
        try {
            if (Array.isArray(emitDef)) {
                result.push(emitName);
            }
            else if (typeof emitDef === 'object' && emitDef !== null) {
                result.push(emitName);
            }
        }
        catch (error) {
            context.errors.push({
                path: `emits.${emitName}`,
                message: error instanceof Error ? error.message : String(error),
                value: emitDef,
            });
        }
    }
    return result;
}
//# sourceMappingURL=emits-parser.js.map