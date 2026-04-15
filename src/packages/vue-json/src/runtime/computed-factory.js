import { computed } from 'vue';
import { ComponentCreationError } from '../utils/error';
import { transformFunctionBody } from './value-resolver';
import { createStateProxy } from './state-factory';
export function createComputed(definition, context, state, stateTypes = {}, coreScope) {
    const computeds = {};
    if (!definition)
        return computeds;
    const renderContext = {
        props: context.props,
        state: state,
        computed: computeds,
        methods: {},
        components: {},
        slots: context.slots,
        attrs: context.attrs,
        emit: context.emit,
        provide: {},
        stateTypes,
        coreScope,
    };
    for (const [computedName, computedDef] of Object.entries(definition)) {
        try {
            const getterFn = computedDef.get;
            const getter = createFunctionFromValue(getterFn);
            if (computedDef.set) {
                const setterFn = computedDef.set;
                const setter = createFunctionFromValue(setterFn);
                computeds[computedName] = computed({
                    get: () => getter(renderContext.props, createStateProxy(renderContext.state), createStateProxy(renderContext.computed), renderContext.methods, renderContext.emit, renderContext.slots, renderContext.attrs, renderContext.provide, undefined, coreScope || {}),
                    set: (value) => setter(renderContext.props, createStateProxy(renderContext.state), createStateProxy(renderContext.computed), renderContext.methods, renderContext.emit, renderContext.slots, renderContext.attrs, renderContext.provide, value, coreScope || {}),
                });
            }
            else {
                computeds[computedName] = computed(() => getter(renderContext.props, createStateProxy(renderContext.state), createStateProxy(renderContext.computed), renderContext.methods, renderContext.emit, renderContext.slots, renderContext.attrs, renderContext.provide, undefined, coreScope || {}));
            }
        }
        catch (error) {
            throw new ComponentCreationError(context.props?.['__componentName__'] || 'Unknown', `Failed to create computed "${computedName}": ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    return computeds;
}
function createFunctionFromValue(fnValue) {
    const transformedBody = transformFunctionBody(fnValue.body);
    const rawFn = new Function('props', 'state', 'computed', 'methods', 'emit', 'slots', 'attrs', 'provide', 'value', 'coreScope', `"use strict"; ${transformedBody}`);
    return rawFn;
}
//# sourceMappingURL=computed-factory.js.map