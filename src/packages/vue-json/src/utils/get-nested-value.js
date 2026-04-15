export function getNestedValue(obj, path) {
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
//# sourceMappingURL=get-nested-value.js.map