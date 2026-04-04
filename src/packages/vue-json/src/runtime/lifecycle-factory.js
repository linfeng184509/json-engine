import { onMounted, onUnmounted, onUpdated, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onErrorCaptured, onActivated, onDeactivated, } from 'vue';
import { ComponentCreationError } from '../utils/error';
import { executeFunction } from './value-resolver';
import { getLogger } from '../utils/logger';
const logger = getLogger('lifecycle-factory');
export function setupLifecycle(definition, context, state, computed, methods, coreScope) {
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
        coreScope,
    };
    logger.debug('Setting up lifecycle hooks');
    setupHook(definition.onMounted, onMounted, renderContext, 'onMounted');
    setupHook(definition.onUnmounted, onUnmounted, renderContext, 'onUnmounted');
    setupHook(definition.onUpdated, onUpdated, renderContext, 'onUpdated');
    setupHook(definition.onBeforeMount, onBeforeMount, renderContext, 'onBeforeMount');
    setupHook(definition.onBeforeUnmount, onBeforeUnmount, renderContext, 'onBeforeUnmount');
    setupHook(definition.onBeforeUpdate, onBeforeUpdate, renderContext, 'onBeforeUpdate');
    setupHook(definition.onErrorCaptured, onErrorCaptured, renderContext, 'onErrorCaptured', true);
    setupHook(definition.onActivated, onActivated, renderContext, 'onActivated');
    setupHook(definition.onDeactivated, onDeactivated, renderContext, 'onDeactivated');
}
function setupHook(hookFns, hookFn, context, hookName, hasErrorArg = false) {
    if (!hookFns)
        return;
    const fns = Array.isArray(hookFns) ? hookFns : [hookFns];
    for (const fnValue of fns) {
        try {
            const handler = createHookHandler(fnValue, context, hasErrorArg);
            hookFn(handler);
        }
        catch (error) {
            throw new ComponentCreationError(context.props?.['__componentName__'] || 'Unknown', `Failed to setup ${hookName}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
function createHookHandler(fnValue, context, hasErrorArg) {
    return (error) => {
        logger.debug('Hook fired: %s', context.props?.['__componentName__']);
        if (hasErrorArg) {
            return executeFunction(fnValue, context, [error]);
        }
        return executeFunction(fnValue, context, []);
    };
}
//# sourceMappingURL=lifecycle-factory.js.map