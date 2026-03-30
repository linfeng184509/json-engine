<template>
  <div
    class="canvas-node"
    :class="{
      'canvas-node--selected': isSelected,
      'canvas-node--drop-before': isDropBefore,
      'canvas-node--drop-after': isDropAfter,
      'canvas-node--drop-inside': isDropInside,
      'canvas-node--form': node.type === 'AForm',
      'canvas-node--form-item': node.type === 'AFormItem'
    }"
    @click.stop="onClick"
    @contextmenu.stop="onContextMenu"
    @dragover.prevent.stop="onDragOver"
    @dragleave.stop="onDragLeave"
    @drop.prevent.stop="onDrop"
  >
    <div class="canvas-node-header">
      <span class="canvas-node-tag">{{ node.type }}</span>
      <span v-if="getLabel" class="canvas-node-label">{{ getLabel }}</span>
    </div>
    <div class="canvas-node-preview">
      <component :is="previewComponent" />
    </div>
    <div v-if="hasChildren" class="canvas-node-children">
      <CanvasNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected-id="selectedId"
        :drop-target-id="dropTargetId"
        :drop-position="dropPosition"
        @select="emit('select', $event)"
        @drop-node="emit('dropNode', $event[0], $event[1], $event[2])"
        @context-menu="emit('contextMenu', $event[0], $event[1], $event[2])"
      />
    </div>
    <div v-if="isContainer && !hasChildren" class="canvas-node-placeholder">
      {{ t.canvas.dropHere }}
    </div>
    <div v-if="isDropBefore" class="drop-indicator drop-indicator--before"></div>
    <div v-if="isDropAfter" class="drop-indicator drop-indicator--after"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, resolveComponent } from 'vue'
import type { DesignNode, DropPosition } from '../types'
import { useLocale } from '../i18n'

const { t } = useLocale()

const props = defineProps<{
  node: DesignNode
  selectedId: string | null
  dropTargetId: string | null
  dropPosition: DropPosition | null
}>()

const emit = defineEmits<{
  select: [id: string]
  dropNode: [targetId: string, position: DropPosition, data: string]
  contextMenu: [nodeId: string, x: number, y: number]
}>()

const isSelected = computed(() => props.selectedId === props.node.id)
const isDropTarget = computed(() => props.dropTargetId === props.node.id)
const isDropBefore = computed(() => isDropTarget.value && props.dropPosition === 'before')
const isDropAfter = computed(() => isDropTarget.value && props.dropPosition === 'after')
const isDropInside = computed(() => isDropTarget.value && props.dropPosition === 'inside')
const isContainer = computed(() => props.node.type === 'AForm' || props.node.type === 'AFormItem')
const hasChildren = computed(() => props.node.children && props.node.children.length > 0)

const getLabel = computed(() => {
  return props.node.props?.label || props.node.props?.placeholder || props.node.label
})

function resolveComp(type: string) {
  try { return resolveComponent(type, false) } catch { return type }
}

const previewComponent = computed(() => {
  const p = props.node.props || {}
  const style: any = { pointerEvents: 'none' }

  if (props.node.type === 'AInput') {
    return h(resolveComp('AInput'), { placeholder: p.placeholder || '请输入', disabled: true, style, allowClear: p.allowClear, size: p.size })
  }
  if (props.node.type === 'AInputPassword') {
    return h(resolveComp('AInputPassword'), { placeholder: p.placeholder || '请输入密码', disabled: true, style })
  }
  if (props.node.type === 'ATextArea') {
    return h(resolveComp('ATextArea'), { placeholder: p.placeholder || '请输入', disabled: true, rows: p.rows || 3, style })
  }
  if (props.node.type === 'AInputNumber') {
    return h(resolveComp('AInputNumber'), { placeholder: p.placeholder || '请输入', disabled: true, style: { ...style, width: '100%' } })
  }
  if (props.node.type === 'ASelect') {
    return h(resolveComp('ASelect'), { placeholder: p.placeholder || '请选择', disabled: true, style: { ...style, width: '100%' } })
  }
  if (props.node.type === 'ASwitch') {
    return h(resolveComp('ASwitch'), { disabled: true, checkedChildren: p.checkedChildren, unCheckedChildren: p.unCheckedChildren, style })
  }
  if (props.node.type === 'ADatePicker') {
    return h(resolveComp('ADatePicker'), { placeholder: p.placeholder || '请选择日期', disabled: true, style: { ...style, width: '100%' } })
  }
  if (props.node.type === 'ATimePicker') {
    return h(resolveComp('ATimePicker'), { placeholder: p.placeholder || '请选择时间', disabled: true, style: { ...style, width: '100%' } })
  }
  if (props.node.type === 'ARadioGroup') {
    const Radio = resolveComp('ARadio')
    return h(resolveComp('ARadioGroup'), { disabled: true, style }, () => [
      h(Radio, { value: '1' }, () => '选项1'),
      h(Radio, { value: '2' }, () => '选项2')
    ])
  }
  if (props.node.type === 'ACheckboxGroup') {
    const Cb = resolveComp('ACheckbox')
    return h(resolveComp('ACheckboxGroup'), { disabled: true, style }, () => [
      h(Cb, { value: '1' }, () => '选项1'),
      h(Cb, { value: '2' }, () => '选项2')
    ])
  }
  if (props.node.type === 'ACascader') {
    return h(resolveComp('ACascader'), { placeholder: p.placeholder || '请选择', disabled: true, style: { ...style, width: '100%' } })
  }
  if (props.node.type === 'AUpload') {
    return h(resolveComp('AUpload'), { disabled: true, style }, () => h('div', { style: { padding: '16px', textAlign: 'center', border: '1px dashed #d9d9d9', borderRadius: '4px' } }, '点击上传'))
  }
  if (props.node.type === 'ARate') {
    return h(resolveComp('ARate'), { disabled: true, style })
  }
  if (props.node.type === 'ASlider') {
    return h(resolveComp('ASlider'), { disabled: true, style })
  }
  if (props.node.type === 'ATransfer') {
    return h('div', { style: { ...style, padding: '8px', color: '#999', fontSize: '12px', textAlign: 'center', border: '1px solid #e8e8e8', borderRadius: '4px' } }, '穿梭框')
  }
  return null
})

function onClick(e: MouseEvent) { emit('select', props.node.id) }
function onContextMenu(e: MouseEvent) { e.preventDefault(); emit('contextMenu', props.node.id, e.clientX, e.clientY) }
function onDragOver(e: DragEvent) {
  if (e.dataTransfer) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const y = e.clientY - rect.top
    const ratio = y / rect.height
    let position: DropPosition = 'inside'
    if (ratio < 0.25) position = 'before'
    else if (ratio > 0.75) position = 'after'
    emit('dropNode', props.node.id, position, '')
  }
}
function onDragLeave() {}
function onDrop(e: DragEvent) {
  const data = e.dataTransfer?.getData('application/json') || ''
  if (data) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const y = e.clientY - rect.top
    const ratio = y / rect.height
    let position: DropPosition = 'inside'
    if (ratio < 0.25) position = 'before'
    else if (ratio > 0.75) position = 'after'
    emit('dropNode', props.node.id, position, data)
  }
}
</script>

<style scoped>
.canvas-node { position: relative; border: 2px solid transparent; border-radius: 4px; transition: all 0.15s; cursor: pointer; margin: 2px 0; }
.canvas-node:hover { border-color: #91caff; }
.canvas-node--selected { border-color: #1890ff !important; box-shadow: 0 0 0 2px rgba(24,144,255,0.15); }
.canvas-node--form { padding: 16px; min-height: 200px; }
.canvas-node--form-item { padding: 8px; margin: 4px 0; }
.canvas-node-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.canvas-node-tag { display: inline-block; padding: 1px 6px; font-size: 11px; background: #e6f4ff; color: #1890ff; border-radius: 3px; }
.canvas-node--selected .canvas-node-tag { background: #1890ff; color: #fff; }
.canvas-node-label { font-size: 12px; color: #666; }
.canvas-node-preview { margin: 4px 0; }
.canvas-node-children { padding-left: 12px; margin-left: 8px; border-left: 2px solid #f0f0f0; }
.canvas-node-placeholder { padding: 16px; color: #bbb; font-size: 12px; text-align: center; border: 1px dashed #e0e0e0; border-radius: 4px; }
.canvas-node--drop-inside { border-color: #1890ff !important; background: rgba(24,144,255,0.06) !important; }
.drop-indicator { position: absolute; left: 0; right: 0; height: 3px; background: #1890ff; z-index: 20; pointer-events: none; border-radius: 2px; }
.drop-indicator--before { top: -2px; }
.drop-indicator--after { bottom: -2px; }
</style>