import type { ComponentObjectPropsOptions, EmitsOptions, Component } from 'vue';
import type { ExpressionParseData, AbstractReferenceParseData, AbstractScopeParseData, FunctionParseData } from '@json-engine/core-engine';
export type ExpressionValue = ExpressionParseData;
export type StateRef = AbstractReferenceParseData & {
    prefix: 'state';
};
export type PropsRef = AbstractReferenceParseData & {
    prefix: 'props';
};
export type ComputedRef = AbstractReferenceParseData & {
    prefix: 'computed';
};
export type ScopeRef = AbstractScopeParseData;
export type FunctionValue = FunctionParseData;
/**
 * 表达式输入 - 需要 {{}} 包裹
 */
export interface ExpressionInput {
    type: 'expression';
    body: string;
}
/**
 * State 引用输入 - 需要 {{}} 包裹
 */
export interface StateInput {
    type: 'state';
    body: string;
}
/**
 * Props 引用输入 - 需要 {{}} 包裹
 */
export interface PropsInput {
    type: 'props';
    body: string;
}
/**
 * Scope 引用输入 - 需要 {{}} 包裹
 */
export interface ScopeInput {
    type: 'scope';
    body: string;
}
/**
 * 函数输入 - params 需要 {{{}}} 包裹，body 需要 {{}} 包裹
 */
export interface FunctionInput {
    type: 'function';
    params: string;
    body: string;
}
export type LiteralValue = string | number | boolean | null | undefined;
export type ObjectValue = {
    _type: 'object';
    value: Record<string, unknown>;
};
export type PropertyValue = LiteralValue | ExpressionValue | StateRef | PropsRef | ScopeRef | ObjectValue;
export type InitialValue = LiteralValue | ExpressionValue | StateRef | PropsRef | ScopeRef;
export type StructuredInput = ExpressionInput | StateInput | PropsInput | ScopeInput | FunctionInput;
export type ValueType = 'String' | 'Number' | 'Boolean' | 'Array' | 'Object' | 'Function' | 'Symbol' | 'BigInt';
export interface PropDefinition {
    type?: ValueType | ValueType[];
    required?: boolean;
    default?: PropertyValue | StructuredInput;
    validator?: FunctionValue;
}
export interface PropsDefinition {
    [propName: string]: PropDefinition;
}
export interface EmitDefinition {
    type?: ValueType | ValueType[];
    validator?: FunctionValue;
}
export interface EmitsDefinition {
    [emitName: string]: EmitDefinition | ValueType[];
}
export interface StateItemDefinition {
    type: 'ref' | 'reactive' | 'shallowRef' | 'shallowReactive' | 'toRef' | 'toRefs' | 'readonly';
    initial?: InitialValue | StructuredInput;
    source?: string;
    key?: string;
}
export interface StateDefinition {
    [stateName: string]: StateItemDefinition;
}
export interface ComputedItemDefinition {
    get: FunctionValue;
    set?: FunctionValue;
}
export interface ComputedDefinition {
    [computedName: string]: ComputedItemDefinition;
}
export interface MethodsDefinition {
    [methodName: string]: FunctionValue;
}
export interface WatchItemDefinition {
    source: ExpressionValue;
    handler: FunctionValue;
    immediate?: boolean;
    deep?: boolean;
    flush?: 'pre' | 'post' | 'sync';
    type?: 'watch' | 'effect';
}
export interface WatchDefinition {
    [watchName: string]: WatchItemDefinition;
}
export interface ProvideItemDefinition {
    key: string;
    value: ExpressionValue | FunctionValue;
}
export interface ProvideDefinition {
    items: ProvideItemDefinition[];
}
export interface InjectItemDefinition {
    key: string;
    default?: PropertyValue;
    from?: string;
}
export interface InjectDefinition {
    items: InjectItemDefinition[];
}
export type LifecycleHookName = 'onMounted' | 'onUnmounted' | 'onUpdated' | 'onBeforeMount' | 'onBeforeUnmount' | 'onBeforeUpdate' | 'onErrorCaptured' | 'onActivated' | 'onDeactivated';
export interface LifecycleDefinition {
    onMounted?: FunctionValue | FunctionValue[];
    onUnmounted?: FunctionValue | FunctionValue[];
    onUpdated?: FunctionValue | FunctionValue[];
    onBeforeMount?: FunctionValue | FunctionValue[];
    onBeforeUnmount?: FunctionValue | FunctionValue[];
    onBeforeUpdate?: FunctionValue | FunctionValue[];
    onErrorCaptured?: FunctionValue | FunctionValue[];
    onActivated?: FunctionValue | FunctionValue[];
    onDeactivated?: FunctionValue | FunctionValue[];
}
export interface LocalComponentDefinition {
    type: 'local';
    source: string;
}
export interface AsyncComponentDefinition {
    type: 'async';
    source: string;
    loadingComponent?: string;
    errorComponent?: string;
    delay?: number;
    timeout?: number;
}
export type ComponentDefinition = LocalComponentDefinition | AsyncComponentDefinition;
export interface ComponentsDefinition {
    [componentName: string]: ComponentDefinition;
}
export interface VNodeDirectives {
    vIf?: ExpressionValue;
    vElseIf?: ExpressionValue;
    vElse?: true;
    vShow?: ExpressionValue;
    vFor?: {
        source: ExpressionValue;
        alias: string;
        index?: string;
    };
    vModel?: {
        prop: StateRef | PropsRef;
        arg?: string;
        event?: string;
        modifiers?: string[];
    };
    vOn?: Record<string, FunctionValue>;
    vBind?: Record<string, ExpressionValue>;
    vSlot?: {
        name?: ExpressionValue | string;
        props?: string[];
    };
    vHtml?: ExpressionValue;
    vText?: ExpressionValue;
    vOnce?: true;
}
export type VNodeChild = string | number | VNodeDefinition | ExpressionValue;
export type VNodeChildren = VNodeChild | VNodeChild[];
export interface VNodeDefinition {
    type: string;
    props?: Record<string, PropertyValue>;
    children?: VNodeChildren;
    directives?: VNodeDirectives;
    key?: string | number;
    ref?: string;
}
export interface TemplateRenderDefinition {
    type: 'template';
    content: VNodeDefinition;
}
export interface FunctionRenderDefinition {
    type: 'function';
    content: FunctionValue;
}
export type RenderDefinition = TemplateRenderDefinition | FunctionRenderDefinition;
export interface StylesDefinition {
    scoped?: boolean;
    css: string;
}
export interface VueJsonSchema {
    name: string;
    props?: PropsDefinition;
    emits?: EmitsDefinition;
    state?: StateDefinition;
    computed?: ComputedDefinition;
    methods?: MethodsDefinition;
    watch?: WatchDefinition;
    provide?: ProvideDefinition;
    inject?: InjectDefinition;
    lifecycle?: LifecycleDefinition;
    components?: ComponentsDefinition;
    render: RenderDefinition;
    styles?: StylesDefinition;
}
export type VueJsonSchemaInput = string | VueJsonSchema;
export interface ParsedSchema {
    name: string;
    props?: ComponentObjectPropsOptions;
    emits?: EmitsOptions;
    state?: StateDefinition;
    computed?: ComputedDefinition;
    methods?: MethodsDefinition;
    watch?: WatchDefinition;
    provide?: ProvideDefinition;
    inject?: InjectDefinition;
    lifecycle?: LifecycleDefinition;
    components?: Record<string, Component>;
    render: RenderDefinition;
    styles?: StylesDefinition;
}
export type { ExpressionParseData, AbstractReferenceParseData as ReferenceParseData, AbstractScopeParseData, FunctionParseData, };
//# sourceMappingURL=schema.d.ts.map