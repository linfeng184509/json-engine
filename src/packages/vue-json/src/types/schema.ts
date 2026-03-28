import type {
  ComponentObjectPropsOptions,
  EmitsOptions,
  Component,
} from 'vue';

export type ValueType = 'String' | 'Number' | 'Boolean' | 'Array' | 'Object' | 'Function' | 'Symbol' | 'BigInt';

export interface PropDefinition {
  type?: ValueType | ValueType[];
  required?: boolean;
  default?: unknown;
  validator?: string;
}

export interface PropsDefinition {
  [propName: string]: PropDefinition;
}

export interface EmitDefinition {
  type?: ValueType | ValueType[];
  validator?: string;
}

export interface EmitsDefinition {
  [emitName: string]: EmitDefinition | ValueType[];
}

export interface StateItemDefinition {
  type: 'ref' | 'reactive' | 'shallowRef' | 'shallowReactive' | 'toRef' | 'toRefs' | 'readonly';
  initial?: unknown;
  source?: string;
  key?: string;
}

export interface StateDefinition {
  [stateName: string]: StateItemDefinition;
}

export interface ComputedDefinition {
  [computedName: string]: {
    get: string;
    set?: string;
  };
}

export interface MethodsDefinition {
  [methodName: string]: string;
}

export interface WatchItemDefinition {
  source: string;
  handler: string;
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
  value: string;
}

export interface ProvideDefinition {
  items: ProvideItemDefinition[];
}

export interface InjectItemDefinition {
  key: string;
  default?: unknown;
  from?: string;
}

export interface InjectDefinition {
  items: InjectItemDefinition[];
}

export type LifecycleHookName =
  | 'onMounted'
  | 'onUnmounted'
  | 'onUpdated'
  | 'onBeforeMount'
  | 'onBeforeUnmount'
  | 'onBeforeUpdate'
  | 'onErrorCaptured'
  | 'onActivated'
  | 'onDeactivated';

export interface LifecycleDefinition {
  onMounted?: string | string[];
  onUnmounted?: string | string[];
  onUpdated?: string | string[];
  onBeforeMount?: string | string[];
  onBeforeUnmount?: string | string[];
  onBeforeUpdate?: string | string[];
  onErrorCaptured?: string | string[];
  onActivated?: string | string[];
  onDeactivated?: string | string[];
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

export interface VNodeDirective {
  vIf?: string;
  vElseIf?: string;
  vElse?: boolean;
  vShow?: string;
  vFor?: {
    source: string;
    alias: string;
    index?: string;
  };
  vModel?: {
    prop: string;
    event?: string;
    modifiers?: string[];
  };
  vOn?: Record<string, string>;
  vBind?: Record<string, string>;
  vSlot?: {
    name?: string;
    props?: string[];
  };
  vHtml?: string;
  vText?: string;
  vOnce?: boolean;
}

export interface VNodeDefinition {
  type: string;
  props?: Record<string, unknown>;
  children?: VNodeChildren;
  directives?: VNodeDirective;
  key?: string | number;
  ref?: string;
}

export type VNodeChildren = string | VNodeDefinition | (string | VNodeDefinition | VNodeChildren)[];

export interface TemplateRenderDefinition {
  type: 'template';
  content: VNodeDefinition;
}

export interface FunctionRenderDefinition {
  type: 'function';
  content: string;
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