function toPascalCase(str) {
    return str
        .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
        .replace(/^([a-z])/, (_, c) => c.toUpperCase());
}
function isValidVariableName(name) {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}
function componentNameParser(key) {
    return toPascalCase(key);
}
function stateKeyParser(key) {
    if (!isValidVariableName(key)) {
        throw new Error(`Invalid state key: "${key}". Must be a valid JavaScript variable name.`);
    }
    return key;
}
export function getVueKeyParsers() {
    return {
        componentName: componentNameParser,
        stateKey: stateKeyParser,
    };
}
export { toPascalCase, isValidVariableName };
//# sourceMappingURL=key-parsers.js.map