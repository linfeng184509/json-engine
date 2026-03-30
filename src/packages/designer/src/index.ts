// Types
export type {
  DesignNode,
  DesignerMeta,
  PropEditorDef,
  FieldPrototype,
  DropPosition,
  DragData,
  DesignerConfig,
  DesignerEvent
} from './types'

// Registry
export {
  registerPrototype,
  getPrototype,
  getAllPrototypes,
  getPrototypesByCategory,
  getCategories,
  initDefaultPrototypes
} from './registry/componentRegistry'

export type { ComponentRegistry } from './registry/componentRegistry'

export { defaultPrototypes } from './registry/fieldPrototypes'

// Tree Operations
export {
  generateId,
  findNode,
  findParentNode,
  insertNode,
  removeNode,
  moveNode,
  duplicateNode,
  updateNodeProps,
  deepCloneNode,
  collectVModelPaths
} from './utils/treeOperations'

// Schema Generator
export { generateJsonVueDef } from './utils/schemaGenerator'

// Composables
export { useDesignTree } from './composables/useDesignTree'
export { useSelection } from './composables/useSelection'
export { useHistory } from './composables/useHistory'
export { useClipboard } from './composables/useClipboard'
export { useDragDrop } from './composables/useDragDrop'
export { useLocale } from './i18n'

// i18n
export { default as zhCN } from './i18n/zh-CN'
export { default as enUS } from './i18n/en-US'

// Components (Vue SFC - re-exported for direct use)
export { default as DesignerShell } from './components/DesignerShell.vue'
export { default as ComponentPalette } from './components/ComponentPalette.vue'
export { default as DesignCanvas } from './components/DesignCanvas.vue'
export { default as PropertyPanel } from './components/PropertyPanel.vue'
export { default as JsonPreview } from './components/JsonPreview.vue'
export { default as FormPreview } from './components/FormPreview.vue'
