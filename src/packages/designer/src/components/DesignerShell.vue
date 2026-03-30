<template>
  <div class="designer" @keydown="onKeyDown">
    <div class="designer-toolbar">
      <button class="toolbar-btn" :disabled="!canUndo()" @click="undo" title="Ctrl+Z">↩ {{ t.toolbar.undo }}</button>
      <button class="toolbar-btn" :disabled="!canRedo()" @click="redo" title="Ctrl+Shift+Z">↪ {{ t.toolbar.redo }}</button>
      <span class="toolbar-divider"></span>
      <button class="toolbar-btn" @click="showJson = !showJson; showPreview = false">{{ showJson ? '🎨 ' + t.toolbar.design : '{ } JSON' }}</button>
      <button class="toolbar-btn" @click="loadDemo">📋 {{ t.toolbar.demo }}</button>
      <button class="toolbar-btn" @click="clearTree">🗑️ {{ t.toolbar.clear }}</button>
      
      <span class="toolbar-spacer"></span>
      <button class="toolbar-btn" @click="toggleLocale">{{ locale === 'zh-CN' ? 'EN' : '中' }}</button>
      <button class="toolbar-btn" @click="showPreview = !showPreview; showJson = false">{{ showPreview ? '🎨 ' + t.toolbar.design : '👁️ ' + t.toolbar.preview }}</button>
      <span class="toolbar-divider"></span>
      <button class="toolbar-btn" :class="{ 'toolbar-btn--active': viewportMode === 'pc' }" @click="setViewport('pc')">🖥️ {{ t.toolbar.pc }}</button>
      <button class="toolbar-btn" :class="{ 'toolbar-btn--active': viewportMode === 'tablet' }" @click="setViewport('tablet')">📋 {{ t.toolbar.tablet }}</button>
      <button class="toolbar-btn" :class="{ 'toolbar-btn--active': viewportMode === 'mobile' }" @click="setViewport('mobile')">📱 {{ t.toolbar.mobile }}</button>
      <span class="toolbar-divider"></span>
      <label class="toolbar-size">
        <input class="toolbar-size-input" type="number" v-model.number="viewportWidth" min="320" max="3840" @change="viewportMode = 'custom'" /> x
        <input class="toolbar-size-input" type="number" v-model.number="viewportHeight" min="320" max="3840" @change="viewportMode = 'custom'" />
        <button class="toolbar-btn toolbar-btn--sm" @click="rotateViewport" :title="t.toolbar.rotate">🔄</button>
      </label>
      <span class="toolbar-divider"></span>
      <div class="zoom-controls">
        <button class="toolbar-btn" @click="zoom.zoomOut()" :disabled="zoom.scale.value <= 0.5">➖</button>
        <select class="toolbar-select" v-model="zoom.scalePercent.value">
          <option :value="50">50%</option>
          <option :value="75">75%</option>
          <option :value="100">100%</option>
          <option :value="125">125%</option>
          <option :value="150">150%</option>
          <option :value="200">200%</option>
        </select>
        <button class="toolbar-btn" @click="zoom.zoomIn()" :disabled="zoom.scale.value >= 2">➕</button>
        <button class="toolbar-btn" @click="zoom.reset()">📐 适应</button>
      </div>
    </div>
    <div class="designer-body">
      <div v-if="showLeftPanel" class="designer-left" :style="{ width: leftWidth + 'px' }">
        <div class="left-tabs">
          <button class="left-tab" :class="{ 'left-tab--active': panelMode === 'component' }" @click="panelMode = 'component'">📦</button>
          <button class="left-tab" :class="{ 'left-tab--active': panelMode === 'api' }" @click="panelMode = 'api'">📡</button>
          <button class="left-tab" :class="{ 'left-tab--active': panelMode === 'ai' }" @click="panelMode = 'ai'">🤖</button>
        </div>
        <div class="left-content">
          <AiPanel v-if="panelMode === 'ai'" @apply-form="onAiApplyForm" />
          <ApiListPanel v-else-if="panelMode === 'api'" :apis="apis" @update:apis="onUpdateApis" />
          <ComponentPalette v-else @drag-start="onPaletteDragStart" @drag-end="onPaletteDragEnd" />
        </div>
        <button class="panel-collapse-btn panel-collapse-btn--left" @click="leftPanelCollapsed = true" title="折叠面板">◀</button>
      </div>
      <div v-else-if="!showPreview" class="panel-collapsed-trigger panel-collapsed-trigger--left" @click="leftPanelCollapsed = false" title="展开面板">▶</div>
      <div class="designer-center">
        <template v-if="effectiveShowPreview">
          <FormPreview 
            :tree="tree" 
            :viewport-width="viewportWidth" 
            :viewport-height="viewportHeight"
            :scale="zoom.scale.value"
            :pan-x="zoom.panX.value"
            :pan-y="zoom.panY.value"
            @pan-start="zoom.startDrag"
            @pan-move="zoom.onDrag"
            @pan-end="zoom.endDrag"
          />
        </template>
        <template v-else-if="showJson">
          <JsonPreview :tree="tree" :apis="apis" @apply="onJsonApply" />
        </template>
        <template v-else>
          <DesignCanvas
            :tree="tree"
            :selected-node-id="selectedNodeId"
            :drop-target-id="dropTargetId"
            :drop-position="dropPosition"
            :viewport-width="viewportWidth"
            :viewport-height="viewportHeight"
            :scale="zoom.scale.value"
            :pan-x="zoom.panX.value"
            :pan-y="zoom.panY.value"
            @select="selectNode"
            @drop="onDrop"
            @context-action="onContextAction"
            @pan-start="zoom.startDrag"
            @pan-move="zoom.onDrag"
            @pan-end="zoom.endDrag"
          />
        </template>
      </div>
      <div v-if="showRightPanel" class="designer-right" :style="{ width: rightWidth + 'px' }">
        <button class="panel-collapse-btn panel-collapse-btn--right" @click="rightPanelCollapsed = true" title="折叠面板">▶</button>
        <PropertyPanel
          :selected-node="selectedNode"
          :all-nodes="tree.children"
          :apis="apis"
          @update-prop="onUpdateProp"
          @update-style="onUpdateStyle"
          @update-events="onUpdateEvents"
          @update-lifecycle="onUpdateLifecycle"
          @update-dependencies="onUpdateDependencies"
          @update-i18n="onUpdateI18n"
          @update-data-source="onUpdateDataSource"
          @delete="onDeleteNode"
        />
      </div>
      <div v-else-if="!effectiveShowPreview" class="panel-collapsed-trigger panel-collapsed-trigger--right" @click="rightPanelCollapsed = false" title="展开面板">◀</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DesignNode, DropPosition, FieldPrototype, ApiEndpoint, DataSourceRef } from '../types'
import { useDesignTree } from '../composables/useDesignTree'
import { useSelection } from '../composables/useSelection'
import { useDragDrop } from '../composables/useDragDrop'
import { useClipboard } from '../composables/useClipboard'
import { useZoom } from '../composables/useZoom'
import { useLocale } from '../i18n'
import { findNode, findParentNode } from '../utils/treeOperations'
import { getPrototype, initDefaultPrototypes } from '../registry/componentRegistry'
import ComponentPalette from './ComponentPalette.vue'
import DesignCanvas from './DesignCanvas.vue'
import PropertyPanel from './PropertyPanel.vue'
import JsonPreview from './JsonPreview.vue'
import FormPreview from './FormPreview.vue'
import ApiListPanel from '../panels/ApiListPanel.vue'
import AiPanel from '../ai/AiPanel.vue'

initDefaultPrototypes()

const { tree, addNode, removeNodeById, moveNodeTo, duplicateNodeById, updateNodePropsById, undo, redo, canUndo, canRedo, clearTree, importTree } = useDesignTree()
const { selectedNodeId, selectNode, getSelectedNode } = useSelection()
const { isDragging, dragData, dropTargetId, dropPosition, startPaletteDrag, endDrag, setDropTarget, clearDropTarget } = useDragDrop()
const clipboard = useClipboard()
const { locale, t, setLocale } = useLocale()

const apis = ref<ApiEndpoint[]>([])
const panelMode = ref<'component' | 'api' | 'ai'>('component')
const treeVersion = ref(0)

// Force reactivity trigger for direct node mutations
function triggerTreeUpdate() {
  treeVersion.value++
  // Create a new reference to trigger computed/watch
  tree.value = { ...tree.value, children: tree.value.children ? [...tree.value.children] : [] }
}

function toggleLocale() {
  setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN')
}

const showJson = ref(false)
const showPreview = ref(false)
const viewportMode = ref<string>('pc')
const viewportWidth = ref(1440)
const viewportHeight = ref(900)
const leftWidth = ref(300)
const leftPanelCollapsed = ref(false)
const rightPanelCollapsed = ref(false)

const zoom = useZoom({ min: 0.5, max: 2, step: 0.1 })

const effectiveShowPreview = computed(() => showPreview.value || panelMode.value === 'ai')
const showLeftPanel = computed(() => !showPreview.value && !leftPanelCollapsed.value)
const showRightPanel = computed(() => !effectiveShowPreview.value && !rightPanelCollapsed.value)

function setViewport(mode: string) {
  viewportMode.value = mode
  switch (mode) {
    case 'pc': viewportWidth.value = 1440; viewportHeight.value = 900; break
    case 'tablet': viewportWidth.value = 768; viewportHeight.value = 1024; break
    case 'mobile': viewportWidth.value = 375; viewportHeight.value = 812; break
  }
}

function rotateViewport() {
  const tmp = viewportWidth.value
  viewportWidth.value = viewportHeight.value
  viewportHeight.value = tmp
  viewportMode.value = 'custom'
}
const rightWidth = ref(280)

const selectedNode = computed(() => getSelectedNode(tree.value))

let dragPrototype: FieldPrototype | null = null

function onPaletteDragStart(prototype: FieldPrototype) {
  dragPrototype = prototype
  startPaletteDrag(prototype)
}

function onPaletteDragEnd() {
  dragPrototype = null
  endDrag()
  clearDropTarget()
}

function onDrop(targetId: string, position: DropPosition, data: string) {
  if (!dragPrototype) {
    try {
      const parsed = JSON.parse(data)
      if (parsed.source === 'palette') {
        const proto = getPrototype(parsed.type)
        if (proto) {
          addNode(targetId, proto, position === 'before' ? 0 : undefined)
        }
      } else if (parsed.source === 'canvas') {
        moveNodeTo(parsed.nodeId, targetId, position)
      }
    } catch {}
  } else {
    addNode(targetId, dragPrototype, position === 'before' ? 0 : undefined)
  }
  endDrag()
  clearDropTarget()
  dragPrototype = null
}

function onContextAction(action: string, nodeId: string) {
  switch (action) {
    case 'delete':
      removeNodeById(nodeId)
      if (selectedNodeId.value === nodeId) selectNode(null)
      break
    case 'duplicate':
      duplicateNodeById(nodeId)
      break
    case 'moveUp': {
      const result = findParentNode(tree.value, nodeId)
      if (result && result.index > 0) {
        moveNodeTo(nodeId, result.parent.children![result.index - 1].id, 'before')
      }
      break
    }
    case 'moveDown': {
      const result = findParentNode(tree.value, nodeId)
      if (result && result.parent.children && result.index < result.parent.children.length - 1) {
        moveNodeTo(nodeId, result.parent.children[result.index + 1].id, 'after')
      }
      break
    }
  }
}

function loadDemo() {
  clearTree()
  const formProto = getPrototype('AForm')!
  const inputProto = getPrototype('AInput')!
  const passwordProto = getPrototype('AInputPassword')!
  const textareaProto = getPrototype('ATextArea')!
  const selectProto = getPrototype('ASelect')!
  const switchProto = getPrototype('ASwitch')!
  const dateProto = getPrototype('ADatePicker')!

  addNode(tree.value.id, inputProto)
  updateNodePropsById(tree.value.children![0].children![0].id, {
    'v-model:value': '$state.formData.username',
    placeholder: '请输入用户名'
  })
  updateNodePropsById(tree.value.children![0].id, { label: '用户名', name: 'username' })

  addNode(tree.value.id, passwordProto)
  updateNodePropsById(tree.value.children![1].children![0].id, {
    'v-model:value': '$state.formData.password',
    placeholder: '请输入密码'
  })
  updateNodePropsById(tree.value.children![1].id, { label: '密码', name: 'password' })

  addNode(tree.value.id, selectProto)
  updateNodePropsById(tree.value.children![2].children![0].id, {
    'v-model:value': '$state.formData.department',
    placeholder: '请选择部门',
    options: [
      { label: '技术部', value: 'tech' },
      { label: '产品部', value: 'product' },
      { label: '设计部', value: 'design' }
    ]
  })
  updateNodePropsById(tree.value.children![2].id, { label: '部门', name: 'department' })

  addNode(tree.value.id, dateProto)
  updateNodePropsById(tree.value.children![3].children![0].id, {
    'v-model:value': '$state.formData.birthday',
    placeholder: '请选择日期'
  })
  updateNodePropsById(tree.value.children![3].id, { label: '生日', name: 'birthday' })

  addNode(tree.value.id, switchProto)
  updateNodePropsById(tree.value.children![4].children![0].id, {
    'v-model:checked': '$state.formData.agreed',
    checkedChildren: '同意',
    unCheckedChildren: '不同意'
  })
  updateNodePropsById(tree.value.children![4].id, { label: '用户协议', name: 'agreed' })

  addNode(tree.value.id, textareaProto)
  updateNodePropsById(tree.value.children![5].children![0].id, {
    'v-model:value': '$state.formData.remark',
    placeholder: '请输入备注信息',
    rows: 3
  })
  updateNodePropsById(tree.value.children![5].id, { label: '备注', name: 'remark' })
}

function onUpdateProp(nodeId: string, name: string, value: unknown) {
  updateNodePropsById(nodeId, { [name]: value })
}

function onUpdateStyle(nodeId: string, style: Record<string, string>) {
  const node = findNode(tree.value, nodeId)
  if (node) {
    node.style = Object.keys(style).length ? { ...style } : undefined
    triggerTreeUpdate()
  }
}

function onUpdateEvents(nodeId: string, events: Record<string, string>) {
  const node = findNode(tree.value, nodeId)
  if (node) {
    node.events = Object.keys(events).length ? { ...events } : undefined
    triggerTreeUpdate()
  }
}

function onUpdateLifecycle(nodeId: string, lifecycle: Record<string, string>) {
  const node = findNode(tree.value, nodeId)
  if (node) {
    node.lifecycle = Object.keys(lifecycle).length ? { ...lifecycle } : undefined
    triggerTreeUpdate()
  }
}

function onDeleteNode(nodeId: string) {
  removeNodeById(nodeId)
  selectNode(null)
}

function onUpdateDependencies(nodeId: string, deps: Record<string, unknown>) {
  const node = findNode(tree.value, nodeId)
  if (node) {
    node.dependencies = Object.keys(deps).length ? { ...deps } : undefined
    triggerTreeUpdate()
  }
}

function onUpdateI18n(nodeId: string, i18n: Record<string, Record<string, string>>) {
  const node = findNode(tree.value, nodeId)
  if (node) {
    node.i18n = Object.keys(i18n).length ? { ...i18n } : undefined
    triggerTreeUpdate()
  }
}

function onUpdateApis(newApis: ApiEndpoint[]) {
  apis.value = newApis
}

function onUpdateDataSource(nodeId: string, dataSource: DataSourceRef | undefined) {
  const node = findNode(tree.value, nodeId)
  if (node) {
    node.dataSource = dataSource ? { ...dataSource } : undefined
    triggerTreeUpdate()
  }
}

function onAiApplyForm(data: Record<string, unknown>) {
  if (data.render) {
    try {
      const newTree = jsonToDesignNode(data.render as any)
      newTree.locked = true
      importTree(newTree)
    } catch (e) {
      console.error('Failed to apply AI form:', e)
    }
  }
}

function onJsonApply(json: string) {
  try {
    const def = JSON.parse(json)
    if (def.render) {
      const newTree = jsonToDesignNode(def.render)
      newTree.id = tree.value.id
      clearTree()
      Object.assign(tree.value, newTree)
    }
  } catch (e) {
    console.error('Invalid JSON:', e)
  }
}

function jsonToDesignNode(vnode: any): DesignNode {
  const node: DesignNode = {
    id: 'n_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    type: vnode.type,
    props: vnode.props
  }
  if (Array.isArray(vnode.children)) {
    node.children = vnode.children.map((c: any) => jsonToDesignNode(c))
  }
  return node
}

function onKeyDown(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
    e.preventDefault(); undo()
  } else if (e.ctrlKey && e.key === 'z' && e.shiftKey) {
    e.preventDefault(); redo()
  } else if (e.key === 'Delete' && selectedNodeId.value) {
    removeNodeById(selectedNodeId.value)
    selectNode(null)
  } else if (e.ctrlKey && e.key === 'c' && selectedNodeId.value) {
    clipboard.copy(tree.value, selectedNodeId.value)
  } else if (e.ctrlKey && e.key === 'v' && selectedNodeId.value) {
    clipboard.paste(tree.value, selectedNodeId.value)
  }
}
</script>

<style scoped>
.designer { display: flex; flex-direction: column; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.designer-toolbar { display: flex; align-items: center; gap: 4px; padding: 6px 12px; background: #fff; border-bottom: 1px solid #e8e8e8; }
.toolbar-spacer { flex: 1; }
.toolbar-btn { padding: 4px 12px; border: 1px solid #d9d9d9; border-radius: 4px; background: #fff; cursor: pointer; font-size: 12px; color: #333; }
.toolbar-btn:hover { border-color: #1890ff; color: #1890ff; }
.toolbar-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.toolbar-btn--active { border-color: #1890ff; background: #e6f7ff; color: #1890ff; }
.toolbar-btn--sm { padding: 4px 8px; font-size: 14px; }
.toolbar-size { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #666; }
.toolbar-size-input { width: 60px; padding: 3px 6px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; text-align: center; }
.toolbar-size-input:focus { border-color: #1890ff; outline: none; }
.toolbar-divider { width: 1px; height: 20px; background: #e8e8e8; margin: 0 4px; }
.zoom-controls { display: flex; align-items: center; gap: 4px; }
.toolbar-select { padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; width: 70px; background: #fff; }
.designer-body { display: flex; flex: 1; overflow: hidden; min-height: 0; position: relative; }
.designer-left { display: flex; border-right: 1px solid #e8e8e8; overflow: hidden; flex-shrink: 0; position: relative; }
.left-tabs { display: flex; flex-direction: column; width: 36px; background: #fafafa; border-right: 1px solid #e8e8e8; flex-shrink: 0; }
.left-tab { width: 36px; height: 36px; border: none; background: transparent; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #f0f0f0; }
.left-tab:hover { background: #f0f0f0; }
.left-tab--active { background: #fff; border-right: 1px solid #fff; margin-right: -1px; }
.left-content { flex: 1; overflow: hidden; min-width: 0; }
.designer-center { flex: 1; overflow: hidden; min-width: 0; position: relative; }
.designer-right { border-left: 1px solid #e8e8e8; overflow: hidden; flex-shrink: 0; position: relative; }

.panel-collapse-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 20px; height: 40px; border: 1px solid #d9d9d9; background: #fff; cursor: pointer; font-size: 10px; color: #999; z-index: 10; display: flex; align-items: center; justify-content: center; }
.panel-collapse-btn:hover { background: #f5f5f5; color: #1890ff; border-color: #1890ff; }
.panel-collapse-btn--left { right: -10px; border-radius: 0 4px 4px 0; }
.panel-collapse-btn--right { left: -10px; border-radius: 4px 0 0 4px; }

.panel-collapsed-trigger { position: absolute; top: 50%; transform: translateY(-50%); width: 16px; height: 60px; background: #fafafa; border: 1px solid #d9d9d9; cursor: pointer; font-size: 10px; color: #999; z-index: 10; display: flex; align-items: center; justify-content: center; }
.panel-collapsed-trigger:hover { background: #f5f5f5; color: #1890ff; border-color: #1890ff; }
.panel-collapsed-trigger--left { left: 0; border-radius: 0 4px 4px 0; border-left: none; }
.panel-collapsed-trigger--right { right: 0; border-radius: 4px 0 0 4px; border-right: none; }
</style>