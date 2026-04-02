import { watch, watchEffect } from 'vue';
import { ComponentCreationError } from '../utils/error';
import { evaluateExpression, executeFunction } from './value-resolver';
export function setupWatchers(definition, context, state, computed, methods) {
    if (!definition)
        return;
    const renderContext = {
        props: context.props,
        state: state,
        computed: computed,
        methods,
        components: {},
        slots: context.slots,
        attrs: context.attrs,
        emit: context.emit,
        provide: {},
    };
    for (const [watchName, watchDef] of Object.entries(definition)) {
        try {
            const def = watchDef;
            if (def.type === 'effect') {
                const effectFn = createEffectFunction(def.handler, renderContext);
                watchEffect(effectFn);
                continue;
            }
            const source = createWatchSource(def.source, renderContext);
            const handler = createWatchHandler(def.handler, renderContext);
            const options = {
                immediate: def.immediate,
                deep: def.deep,
                flush: def.flush,
            };
            watch(source, handler, options);
        }
        catch (error) {
            throw new ComponentCreationError(context.props?.['__componentName__'] || 'Unknown', `Failed to setup watch "${watchName}": ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
function createWatchSource(sourceExpr, context) {
    return () => {
        try {
            return evaluateExpression(sourceExpr.expression, context);
        }
        catch {
            return undefined;
        }
    };
}
function createWatchHandler(handlerFn, context) {
    return (newValue, oldValue) => {
        return executeFunction(handlerFn, context, [newValue, oldValue]);
    };
}
function createEffectFunction(effectFn, context) {
    return () => {
        return executeFunction(effectFn, context, []);
    };
}
//# sourceMappingURL=watch-factory.js.map