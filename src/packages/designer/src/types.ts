import type { PropsDefinition, PropDefinition, FunctionValue } from '@json-engine/vue-json'

/**
 * Design tree node - internal representation used during design.
 * Includes designer-specific metadata that is stripped on export.
 */
export interface DesignNode {
  /** Unique identifier (UUID) */
  id: string
  /** Component type name (e.g., 'AInput', 'ASelect', 'AFormItem', 'AForm') */
  type: string
  /** Display label shown in palette and canvas hover */
  label?: string
  /** Component props */
  props?: Record<string, unknown>
  /** Inline styles */
  style?: Record<string, string>
  /** Event handlers */
  events?: Record<string, string>
  /** Lifecycle hooks */
  lifecycle?: Record<string, string>
  /** Dependency/cascading configuration */
  dependencies?: Record<string, unknown>
  /** i18n translations: { 'zh-CN': { label: '姓名', placeholder: '请输入' }, 'en-US': { label: 'Name', placeholder: 'Enter' } } */
  i18n?: Record<string, Record<string, string>>
  /** Remote data source reference */
  dataSource?: DataSourceRef
  /** Child nodes (for containers like AForm, AFormItem) */
  children?: DesignNode[]
  /** Named slots */
  slots?: Record<string, DesignNode[]>
  /** Prevent deletion when true */
  locked?: boolean
  /** Designer-only metadata - stripped on export */
  designerMeta?: DesignerMeta
}

/**
 * Designer metadata attached to nodes - not included in output JSON
 */
export interface DesignerMeta {
  /** Icon for palette display */
  icon?: string
  /** Category for palette grouping */
  category?: string
  /** Default props when creating a new instance */
  defaultProps?: Record<string, unknown>
  /** Property editor definitions for the right panel (extends vue-json PropsDefinition) */
  propEditors?: PropEditorsDefinition
}

/**
 * Property editor definition - extends vue-json PropDefinition with designer-specific fields.
 * Strictly follows core-engine design specification.
 */
export interface PropEditorDefinition extends PropDefinition {
  /** Editor widget type for design-time editing */
  editor?: 'string' | 'number' | 'boolean' | 'select' | 'expression' | 'json' | 'i18n'
  /** Display label in the property panel */
  label?: string
  /** Options for select editor */
  options?: { label: string; value: unknown }[]
  /** Property group for panel organization */
  group?: 'basic' | 'validation' | 'layout' | 'style'
  /** Placeholder text for input editors */
  placeholder?: string
  /** Help text shown below the editor */
  help?: string
}

/**
 * Props definition with designer extensions - uses vue-json PropsDefinition as base
 */
export interface PropEditorsDefinition extends PropsDefinition {
  [propName: string]: PropEditorDefinition
}

/**
 * Field prototype - defines a component type available in the palette
 */
export interface FieldPrototype {
  /** Component type name (must match Ant Design Vue component name) */
  type: string
  /** Display name in the palette */
  label: string
  /** Icon (emoji or icon class) */
  icon: string
  /** Category for palette grouping */
  category: string
  /** Default props when dropped */
  defaultProps?: Record<string, unknown>
  /** Default children (e.g., ASelectOption nodes for ASelect) */
  defaultChildren?: DesignNode[]
  /** Property editor definitions (uses vue-json PropsDefinition format) */
  propEditors: PropEditorsDefinition
  /** Whether this component is a container (can have children dropped into it) */
  isContainer?: boolean
  /** Auto-wrap in parent component when dropped (e.g., AInput -> AFormItem) */
  wrapIn?: string
}

/**
 * Drop position relative to a target node
 */
export type DropPosition = 'before' | 'after' | 'inside'

/**
 * Drag data from palette or canvas
 */
export interface DragData {
  /** Source: 'palette' for new components, 'canvas' for reordering */
  source: 'palette' | 'canvas'
  /** Component type (for palette) or node ID (for canvas) */
  typeOrId: string
  /** Prototype (for palette drag) */
  prototype?: FieldPrototype
}

/**
 * Designer configuration options
 */
export interface DesignerConfig {
  /** Form name */
  formName?: string
  /** Form layout mode */
  formLayout?: 'horizontal' | 'vertical' | 'inline'
  /** Label width (px or CSS value) */
  labelWidth?: string | number
  /** Component size */
  size?: 'small' | 'middle' | 'large'
}

/**
 * Designer event types
 */
export type DesignerEvent =
  | { type: 'node:add'; node: DesignNode; parentId: string; index?: number }
  | { type: 'node:remove'; nodeId: string }
  | { type: 'node:move'; nodeId: string; targetId: string; position: DropPosition }
  | { type: 'node:update'; nodeId: string; props: Record<string, unknown> }
  | { type: 'node:select'; nodeId: string | null }
  | { type: 'history:undo' }
  | { type: 'history:redo' }
  | { type: 'tree:clear' }
  | { type: 'tree:import'; tree: DesignNode }
  | { type: 'tree:export' }

/**
 * API endpoint definition for remote data sources
 */
export interface ApiEndpoint {
  /** Unique ID */
  id: string
  /** API name/label */
  name: string
  /** Request URL */
  url: string
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  /** Request headers */
  headers?: Record<string, string>
  /** Request body (for POST/PUT/PATCH) */
  body?: string
  /** Response data path (e.g., 'data.list', 'result.items') */
  dataPath?: string
  /** Response label field (for select options) */
  labelField?: string
  /** Response value field (for select options) */
  valueField?: string
  /** Description */
  description?: string
}

/**
 * Remote data source reference for a component
 */
export interface DataSourceRef {
  /** Referenced API endpoint ID */
  apiId: string
  /** Auto load on mount */
  autoLoad?: boolean
  /** Dependent fields for cascading load */
  dependFields?: string[]
  /** Transform response data (JavaScript expression) */
  transform?: string
}

export type { PropsDefinition, PropDefinition, FunctionValue }
