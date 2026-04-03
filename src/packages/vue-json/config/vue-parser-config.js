import { createParserConfig, ValueReferenceParser, createReferenceRegex, } from '@json-engine/core-engine';
const VUE_REFERENCE_PREFIXES = ['props', 'state', 'computed'];
const VUE_SCOPE_NAMES = ['core', 'goal'];
function stateValueParser(body) {
    const regex = createReferenceRegex(['state']);
    const valueBody = { type: 'reference', body };
    try {
        const result = ValueReferenceParser(valueBody, regex);
        if (result.success && result.data) {
            return result.data;
        }
    }
    catch {
        // Fallback: try to parse body directly
    }
    const match = body.match(/^\{\{ref_state_(.+)\}\}$/);
    if (match) {
        const fullPath = match[1];
        const dotIndex = fullPath.indexOf('.');
        if (dotIndex > 0) {
            return {
                _type: 'reference',
                prefix: 'state',
                variable: fullPath.substring(0, dotIndex),
                path: fullPath.substring(dotIndex + 1),
            };
        }
        return { _type: 'reference', prefix: 'state', variable: fullPath };
    }
    return { _type: 'reference', prefix: 'state', variable: body };
}
function propsValueParser(body) {
    const regex = createReferenceRegex(['props']);
    const valueBody = { type: 'reference', body };
    try {
        const result = ValueReferenceParser(valueBody, regex);
        if (result.success && result.data) {
            return result.data;
        }
    }
    catch {
        // Fallback: try to parse body directly
    }
    const match = body.match(/^\{\{ref_props_(.+)\}\}$/);
    if (match) {
        const fullPath = match[1];
        const dotIndex = fullPath.indexOf('.');
        if (dotIndex > 0) {
            return {
                _type: 'reference',
                prefix: 'props',
                variable: fullPath.substring(0, dotIndex),
                path: fullPath.substring(dotIndex + 1),
            };
        }
        return { _type: 'reference', prefix: 'props', variable: fullPath };
    }
    return { _type: 'reference', prefix: 'props', variable: body };
}
function importValueParser(body) {
    return { _type: 'import', path: body };
}
const vueParserConfig = createParserConfig({
    referencePrefixes: VUE_REFERENCE_PREFIXES,
    scopeNames: VUE_SCOPE_NAMES,
    valueParsers: {
        state: stateValueParser,
        props: propsValueParser,
        import: importValueParser,
    },
    debug: {
        enabled: true,
        logLevel: 'debug',
        onTrace: (trace) => {
            console.log(`[DebugTrace] ${trace.parser} | ${trace.path} | ${trace.duration.toFixed(2)}ms`, trace.duration > 10 ? '⚠️ SLOW' : '');
        },
    },
});
export { vueParserConfig, createParserConfig };
//# sourceMappingURL=vue-parser-config.js.map