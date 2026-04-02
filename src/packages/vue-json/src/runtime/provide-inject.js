import { provide, inject } from 'vue';
import { ComponentCreationError } from '../utils/error';
import { evaluateExpression, executeFunction, isExpressionParseData, isFunctionParseData } from './value-resolver';
export function setupProvide(definition, context, state, computed, methods) {
    const provided = {};
    if (!definition)
        return provided;
    const renderContext = {
        props: context.props,
        state: state,
        computed: computed,
        methods,
        components: {},
        slots: context.slots,
        attrs: context.attrs,
        emit: context.emit,
        provide: provided,
    };
    for (const item of definition.items) {
        try {
            const value = resolveProvideValue(item.value, renderContext);
            provide(item.key, value);
            provided[item.key] = value;
        }
        catch (error) {
            throw new ComponentCreationError(context.props?.['__componentName__'] || 'Unknown', `Failed to provide "${item.key}": ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    return provided;
}
function resolveProvideValue(value, context) {
    if (isExpressionParseData(value)) {
        return evaluateExpression(value.expression, context);
    }
    if (isFunctionParseData(value)) {
        return executeFunction(value, context, []);
    }
    return value;
}
export function setupInject(definition, context) {
    const injected = {};
    if (!definition)
        return injected;
    for (const item of definition.items) {
        try {
            const defaultValue = item.default !== undefined ? resolveInjectDefault(item.default) : undefined;
            const value = inject(item.key, defaultValue);
            injected[item.key] = value;
        }
        catch (error) {
            throw new ComponentCreationError(context.props?.['__componentName__'] || 'Unknown', `Failed to inject "${item.key}": ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    return injected;
}
function resolveInjectDefault(defaultValue) {
    if (defaultValue === null || defaultValue === undefined) {
        return defaultValue;
    }
    if (typeof defaultValue !== 'object') {
        return defaultValue;
    }
    if (isExpressionParseData(defaultValue)) {
        return undefined;
    }
    return defaultValue;
}
//# sourceMappingURL=provide-inject.js.map