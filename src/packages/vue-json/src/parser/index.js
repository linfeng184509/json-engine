import { parseJson } from '@json-engine/core-engine';
import { vueParserConfig } from '../config/vue-parser-config';
import { getVueKeyParsers } from './key-parsers';
import { getPluginRegistry } from '../plugin/plugin-registry';
import { SchemaParseError, ValidationError } from '../utils/error';
import { parseProps } from './props-parser';
import { parseEmits } from './emits-parser';
import { parseState } from './state-parser';
import { parseComputed } from './computed-parser';
import { parseMethods } from './methods-parser';
import { parseWatch } from './watch-parser';
import { parseProvide, parseInject } from './provide-inject-parser';
import { parseLifecycle } from './lifecycle-parser';
import { parseComponents } from './components-parser';
import { parseRender } from './render-parser';
function createParserContext(schema) {
    return {
        schema,
        errors: [],
        warnings: [],
    };
}
function validateSchemaStructure(data) {
    if (!data || typeof data !== 'object') {
        throw new ValidationError('', 'Schema must be an object');
    }
    const schema = data;
    if (typeof schema.name !== 'string' || !schema.name.trim()) {
        throw new ValidationError('name', 'Schema must have a valid "name" string');
    }
    if (!schema.render) {
        throw new ValidationError('render', 'Schema must have a "render" property');
    }
    const render = schema.render;
    if (!render.type || !['template', 'function'].includes(render.type)) {
        throw new ValidationError('render.type', 'Render type must be "template" or "function"');
    }
    return true;
}
function buildParserConfig() {
    const registry = getPluginRegistry();
    const pluginValueParsers = {};
    for (const plugin of registry.getInstalledPlugins()) {
        if (plugin.definition.valueTypes) {
            for (const vt of plugin.definition.valueTypes) {
                pluginValueParsers[vt.typeName] = vt.parser;
            }
        }
    }
    return {
        ...vueParserConfig,
        valueParsers: {
            ...vueParserConfig.valueParsers,
            ...pluginValueParsers,
        },
        keyParsers: {
            ...vueParserConfig.keyParsers,
            ...getVueKeyParsers(),
        },
    };
}
export function parseSchema(input) {
    const context = createParserContext({});
    try {
        let json;
        if (typeof input === 'string') {
            try {
                json = JSON.parse(input);
            }
            catch (e) {
                throw new SchemaParseError('', `Invalid JSON string: ${e instanceof Error ? e.message : String(e)}`);
            }
        }
        else {
            json = input;
        }
        const config = buildParserConfig();
        const processed = parseJson(json, config);
        validateSchemaStructure(processed);
        context.schema = processed;
        const result = {
            name: processed.name,
            props: processed.props ? parseProps(processed.props, context) : undefined,
            emits: processed.emits ? parseEmits(processed.emits, context) : undefined,
            state: processed.state ? parseState(processed.state, context) : undefined,
            computed: processed.computed ? parseComputed(processed.computed, context) : undefined,
            methods: processed.methods ? parseMethods(processed.methods, context) : undefined,
            watch: processed.watch ? parseWatch(processed.watch, context) : undefined,
            provide: processed.provide ? parseProvide(processed.provide, context) : undefined,
            inject: processed.inject ? parseInject(processed.inject, context) : undefined,
            lifecycle: processed.lifecycle ? parseLifecycle(processed.lifecycle, context) : undefined,
            components: processed.components ? parseComponents(processed.components, context) : undefined,
            render: parseRender(processed.render, context),
            styles: processed.styles,
        };
        if (context.errors.length > 0) {
            return {
                success: false,
                errors: context.errors,
                warnings: context.warnings.length > 0 ? context.warnings : undefined,
            };
        }
        return {
            success: true,
            data: result,
            warnings: context.warnings.length > 0 ? context.warnings : undefined,
        };
    }
    catch (error) {
        if (error instanceof SchemaParseError || error instanceof ValidationError) {
            context.errors.push({
                path: error.path,
                message: error.message,
                value: error instanceof ValidationError ? error.actualValue : undefined,
                expectedType: error instanceof ValidationError ? error.expectedType : undefined,
                actualType: error instanceof ValidationError ? typeof error.actualValue : undefined,
            });
        }
        else {
            context.errors.push({
                path: '',
                message: error instanceof Error ? error.message : String(error),
            });
        }
        return {
            success: false,
            errors: context.errors,
        };
    }
}
export { parseProps } from './props-parser';
export { parseEmits } from './emits-parser';
export { parseState } from './state-parser';
export { parseComputed } from './computed-parser';
export { parseMethods } from './methods-parser';
export { parseWatch } from './watch-parser';
export { parseProvide, parseInject } from './provide-inject-parser';
export { parseLifecycle } from './lifecycle-parser';
export { parseComponents } from './components-parser';
export { parseRender } from './render-parser';
export { getVueKeyParsers, toPascalCase, isValidVariableName } from './key-parsers';
export { vueParserConfig, createParserConfig } from '../config/vue-parser-config';
//# sourceMappingURL=index.js.map