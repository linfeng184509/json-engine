import { defineComponent, } from 'vue';
import { createParserCache } from '@json-engine/core-engine';
import { parseSchema } from '../parser';
import { createState, createStateProxy } from './state-factory';
import { createComputed } from './computed-factory';
import { setupWatchers } from './watch-factory';
import { setupProvide, setupInject } from './provide-inject';
import { setupLifecycle } from './lifecycle-factory';
import { renderVNode } from './render-factory';
import { injectStyles, generateComponentId } from './style-injector';
import { ComponentCreationError } from '../utils/error';
import { executeFunction } from './value-resolver';
import { getGlobalComponents, getCoreScope } from '../composables/use-core-scope';
import { getPluginRegistry } from '../plugin/plugin-registry';
import { PageLoader } from '../components/PageLoader';
import { Slot } from '../components/Slot';
const componentCache = createParserCache({
    enabled: true,
    maxSize: 500,
    ttl: 0,
});
const BUILTIN_COMPONENTS = {
    PageLoader,
    Slot,
};
function getAllAvailableComponents(extraComponents) {
    const globalComponents = getGlobalComponents();
    const registryComponents = getPluginRegistry().getAllComponents();
    const result = {};
    for (const [name, def] of Object.entries(registryComponents)) {
        if (def && typeof def === 'object' && 'component' in def) {
            result[name] = def.component;
        }
    }
    return {
        ...globalComponents,
        ...result,
        ...extraComponents,
    };
}
export function createComponentCreator(schemaInput, options = {}) {
    const { cache = true, injectStyles: shouldInjectStyles = true, debug = false, extraComponents = {}, registerPageLoader = true, coreScope = getCoreScope(), } = options;
    const cacheKey = typeof schemaInput === 'string' ? schemaInput : (schemaInput.name || JSON.stringify(schemaInput));
    if (cache) {
        const cached = componentCache.get(cacheKey);
        if (cached)
            return cached;
    }
    const parseResult = parseSchema(schemaInput);
    if (!parseResult.success || !parseResult.data) {
        const errors = parseResult.errors?.map((e) => e.message).join('; ') || 'Unknown parse error';
        throw new ComponentCreationError('Unknown', `Schema parsing failed: ${errors}`);
    }
    const schema = parseResult.data;
    const componentId = generateComponentId(schema.name);
    if (shouldInjectStyles && schema.styles) {
        injectStyles(componentId, schema.styles.css, schema.styles.scoped);
    }
    const componentOptions = {
        name: schema.name,
        props: schema.props,
        emits: schema.emits,
        components: schema.components,
        setup(props, { emit, slots, attrs }) {
            const context = {
                props: { ...props, __componentName__: schema.name },
                emit,
                slots,
                attrs,
            };
            const injected = schema.inject ? setupInject({ items: schema.inject.items }, context) : {};
            const state = createState(schema.state, context);
            const stateTypes = {};
            if (schema.state) {
                for (const [key, def] of Object.entries(schema.state)) {
                    if (def.type === 'toRef' || def.type === 'toRefs') {
                        stateTypes[key] = 'ref';
                    }
                    else {
                        stateTypes[key] = def.type;
                    }
                }
            }
            const computedRefs = createComputed(schema.computed, context, state, stateTypes, coreScope);
            const provideRef = { value: injected };
            const methods = createMethods(schema.methods, context, state, computedRefs, provideRef, stateTypes, coreScope);
            setupWatchers(schema.watch, context, state, computedRefs, methods);
            setupLifecycle(schema.lifecycle, context, state, computedRefs, methods, coreScope);
            const provided = schema.provide
                ? setupProvide(schema.provide, context, state, computedRefs, methods)
                : {};
            provideRef.value = { ...injected, ...provided };
            if (debug) {
                console.log(`[vue-json-engine] ${schema.name} render context:`, {
                    props,
                    state,
                    computed: computedRefs,
                    methods,
                    stateTypes,
                });
            }
            return () => {
                try {
                    const allComponents = {
                        ...(registerPageLoader ? BUILTIN_COMPONENTS : {}),
                        ...getAllAvailableComponents(extraComponents),
                    };
                    return renderVNode(schema.render, {
                        props: context.props,
                        state,
                        computed: computedRefs,
                        methods,
                        components: allComponents,
                        slots,
                        attrs,
                        emit,
                        provide: provideRef.value,
                        stateTypes,
                        coreScope: coreScope,
                    });
                }
                catch (error) {
                    console.error(`[vue-json-engine] Render error in ${schema.name}:`, error);
                    throw error;
                }
            };
        },
    };
    const component = defineComponent(componentOptions);
    if (cache) {
        componentCache.set(cacheKey, component);
    }
    return component;
}
function createMethods(definition, setupContext, state, computed, provideRef, stateTypes, coreScope) {
    const methods = {};
    if (!definition)
        return methods;
    for (const [methodName, fnValue] of Object.entries(definition)) {
        methods[methodName] = (...args) => {
            const renderContext = {
                props: setupContext.props,
                state: createStateProxy(state),
                computed: computed,
                methods,
                emit: setupContext.emit,
                slots: setupContext.slots,
                attrs: setupContext.attrs,
                provide: provideRef.value,
                components: {},
                stateTypes,
                coreScope: coreScope,
            };
            return executeFunction(fnValue, renderContext, args);
        };
    }
    return methods;
}
export function clearComponentCache() {
    componentCache.clear();
}
export function getCachedComponents() {
    const result = new Map();
    for (const [key, value] of componentCache.entries()) {
        result.set(key, value);
    }
    return result;
}
//# sourceMappingURL=component-creator.js.map