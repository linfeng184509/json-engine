import type {
  ComponentObjectPropsOptions,
  EmitsOptions,
  Component,
} from 'vue';

import type {
  ExpressionParseData,
  AbstractReferenceParseData,
  AbstractScopeParseData,
  FunctionParseData,
} from '@json-engine/core-engine';

// ============ Core Structured Types (core-engine compatible) ============

/**
 * 表达式值 - 带类型标记的 ExpressionParseData
 * 输入格式: { type: 'expression', body: '{{xxx}}' }
 * parseJson 输出: { _type: 'expression', expression: 'xxx' 或 AbstractReferenceParseData }
 */
export interface ExpressionValue extends ExpressionParseData {
  _type: 'expression';
}

/**
 * State 引用 - 基于 AbstractReferenceParseData
 * 输入格式: { type: 'reference', body: '{{ref_state_xxx}}' }
 * parseJson 输出: { _type: 'reference', prefix: 'state', variable: 'xxx' }
 * 支持点号路径: { _type: 'reference', prefix: 'state', variable: 'formData', path: 'name' }
 */
export interface StateRef extends AbstractReferenceParseData {
  _type: 'reference';
  prefix: 'state';
  path?: string;
}

/**
 * Props 引用 - 基于 AbstractReferenceParseData
 * 输入格式: { type: 'reference', body: '{{ref_props_xxx}}' }
 * parseJson 输出: { _type: 'reference', prefix: 'props', variable: 'xxx' }
 * 支持点号路径: { _type: 'reference', prefix: 'props', variable: 'user', path: 'name' }
 */
export interface PropsRef extends AbstractReferenceParseData {
  _type: 'reference';
  prefix: 'props';
  path?: string;
}

/**
 * Computed 引用 - 基于 AbstractReferenceParseData
 * 输入格式: { type: 'reference', body: '{{ref_computed_xxx}}' }
 */
export interface ComputedRef extends AbstractReferenceParseData {
  _type: 'reference';
  prefix: 'computed';
  path?: string;
}

/**
 * Scope 引用 - 基于 AbstractScopeParseData
 * 输入格式: { type: 'scope', body: '{{$_[core|goal]_xxx}}' }
 * parseJson 输出: { _type: 'scope', scope: 'core'|'goal', variable: 'xxx' }
 */
export interface ScopeRef extends AbstractScopeParseData {
  _type: 'scope';
}

/**
 * 函数值 - 带类型标记的 FunctionParseData
 * 输入格式: { type: 'function', params: '{{{...}}}', body: '{{...}}' }
 * parseJson 输出: { _type: 'function', params: {...}, body: '...' }
 */
export interface FunctionValue extends FunctionParseData {
  _type: 'function';
}

// ============ Input Types (parseJson 前的输入格式) ============

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

// ============ Composite Types ============

export type LiteralValue = string | number | boolean | null | undefined;
export type PropertyValue = LiteralValue | ExpressionValue | StateRef | PropsRef | ScopeRef;
export type InitialValue = LiteralValue | ExpressionValue | StateRef | PropsRef | ScopeRef;

export type StructuredInput = ExpressionInput | StateInput | PropsInput | ScopeInput | FunctionInput;

// ============ Props Definition ============

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

// ============ Emits Definition ============

export interface EmitDefinition {
  type?: ValueType | ValueType[];
  validator?: FunctionValue;
}

export interface EmitsDefinition {
  [emitName: string]: EmitDefinition | ValueType[];
}

// ============ State Definition ============

export interface StateItemDefinition {
  type: 'ref' | 'reactive' | 'shallowRef' | 'shallowReactive' | 'toRef' | 'toRefs' | 'readonly';
  initial?: InitialValue | StructuredInput;
  source?: string;
  key?: string;
}

export interface StateDefinition {
  [stateName: string]: StateItemDefinition;
}

// ============ Computed Definition ============

export interface ComputedItemDefinition {
  get: FunctionValue;
  set?: FunctionValue;
}

export interface ComputedDefinition {
  [computedName: string]: ComputedItemDefinition;
}

// ============ Methods Definition ============

export interface MethodsDefinition {
  [methodName: string]: FunctionValue;
}

// ============ Watch Definition ============

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

// ============ Provide/Inject Definition ============

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

// ============ Lifecycle Definition ============

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

// ============ Components Definition ============

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

// ============ VNode Definition ============

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
    event?: string;
    modifiers?: string[];
  };
  vOn?: Record<string, FunctionValue>;
  vBind?: Record<string, ExpressionValue>;
  vSlot?: {
    name?: ExpressionValue;
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

// ============ Render Definition ============

export interface TemplateRenderDefinition {
  type: 'template';
  content: VNodeDefinition;
}

export interface FunctionRenderDefinition {
  type: 'function';
  content: FunctionValue;
}

export type RenderDefinition = TemplateRenderDefinition | FunctionRenderDefinition;

// ============ Styles Definition ============

export interface StylesDefinition {
  scoped?: boolean;
  css: string;
}

// ============ Schema Definition (输入格式) ============

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

// ============ Parsed Schema (Runtime) ============

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

// ============ Re-export core-engine types ============

export type {
  ExpressionParseData,
  AbstractReferenceParseData as ReferenceParseData,
  AbstractScopeParseData,
  FunctionParseData,
};
