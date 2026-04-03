import type { Ref, ComputedRef, Reactive, EmitFn, Slots, Component } from 'vue';
export interface ParserContext {
    schema: import('./schema').VueJsonSchema;
    errors: ParseError[];
    warnings: ParseWarning[];
}
export interface ParseError {
    path: string;
    message: string;
    value?: unknown;
    expectedType?: string;
    actualType?: string;
}
export interface ParseWarning {
    path: string;
    message: string;
    suggestion?: string;
}
export interface RenderContext {
    props: Record<string, unknown>;
    state: Record<string, Ref | Reactive<unknown>>;
    computed: Record<string, ComputedRef<unknown>>;
    methods: Record<string, (...args: unknown[]) => unknown>;
    components: Record<string, Component>;
    slots: Slots;
    attrs: Record<string, unknown>;
    emit: EmitFn;
    provide: Record<string, unknown>;
    stateTypes?: Record<string, 'ref' | 'reactive' | 'shallowRef' | 'shallowReactive' | 'readonly'>;
    coreScope?: Record<string, unknown>;
}
export interface SetupContext {
    props: Record<string, unknown>;
    emit: EmitFn;
    slots: Slots;
    attrs: Record<string, unknown>;
}
export interface ComponentFactoryOptions {
    name: string;
    props?: import('./schema').PropsDefinition;
    emits?: import('./schema').EmitsDefinition;
    state?: import('./schema').StateDefinition;
    computed?: import('./schema').ComputedDefinition;
    methods?: import('./schema').MethodsDefinition;
    watch?: import('./schema').WatchDefinition;
    provide?: import('./schema').ProvideDefinition;
    inject?: import('./schema').InjectDefinition;
    lifecycle?: import('./schema').LifecycleDefinition;
    components?: import('./schema').ComponentsDefinition;
    render: import('./schema').RenderDefinition;
    styles?: import('./schema').StylesDefinition;
}
export interface ParseResult<T> {
    success: boolean;
    data?: T;
    errors?: ParseError[];
    warnings?: ParseWarning[];
}
export interface CreateComponentOptions {
    cache?: boolean;
    injectStyles?: boolean;
    debug?: boolean;
    extraComponents?: Record<string, Component>;
    registerPageLoader?: boolean;
}
export interface UseVueJsonOptions {
    autoRegister?: boolean;
    onError?: (error: Error) => void;
    cache?: boolean;
}
//# sourceMappingURL=runtime.d.ts.map