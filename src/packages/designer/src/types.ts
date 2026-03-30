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
  /** Property editor definitions for the right panel */
  propEditors?: PropEditorDef[]
}

/**
 * Property editor definition - controls how a prop is edited in the property panel
 */
export interface PropEditorDef {
  /** Prop key name (maps to node.props[key]) */
  name: string
  /** Display label in the property panel */
  label: string
  /** Setter type controlling which editor widget is used */
  setter: 'string' | 'number' | 'boolean' | 'select' | 'expression' | 'json'
  /** Options for select setter */
  options?: { label: string; value: unknown }[]
  /** Default value */
  default?: unknown
  /** Property group for panel organization */
  group?: 'basic' | 'validation' | 'layout' | 'style'
  /** Placeholder text for input setters */
  placeholder?: string
  /** Help text shown below the setter */
  help?: string
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
  /** Property editor definitions */
  propEditors: PropEditorDef[]
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
