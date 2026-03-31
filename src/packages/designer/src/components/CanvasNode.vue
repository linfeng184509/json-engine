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
    :style="mergedStyle"
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
const containerTypes = ['AForm', 'AFormItem', 'ARow', 'ACol', 'ALayout', 'ALayoutHeader', 'ALayoutFooter', 'ALayoutSider', 'ALayoutContent', 'ASpace', 'AButtonGroup', 'ATabs', 'ACard']
const isContainer = computed(() => containerTypes.includes(props.node.type))
const hasChildren = computed(() => props.node.children && props.node.children.length > 0)

const getLabel = computed(() => {
  return props.node.props?.label || props.node.props?.placeholder || props.node.label
})

const mergedStyle = computed(() => {
  const nodeStyle = props.node.style || {}
  return {
    ...nodeStyle,
  }
})

function resolveComp(type: string) {
  try { return resolveComponent(type, false) } catch { return type }
}

const previewComponent = computed(() => {
  const p = props.node.props || {}
  const nodeStyle = props.node.style || {}
  const style = { ...nodeStyle, pointerEvents: 'none' }
  const type = props.node.type

  const containerTypes = ['AForm', 'AFormItem', 'ARow', 'ACol', 'ALayout', 'ALayoutHeader', 'ALayoutFooter', 'ALayoutSider', 'ALayoutContent', 'ASpace', 'AButtonGroup', 'ATabs']
  if (containerTypes.includes(type)) {
    return null
  }

  const widthFull = { ...style, width: '100%' }

  if (type === 'ARadioGroup') {
    const Radio = resolveComp('ARadio')
    return h(resolveComp('ARadioGroup'), { disabled: true, style, ...p }, () => [
      h(Radio, { value: '1' }, () => '选项1'),
      h(Radio, { value: '2' }, () => '选项2')
    ])
  }
  if (type === 'ACheckboxGroup') {
    const Checkbox = resolveComp('ACheckbox')
    return h(resolveComp('ACheckboxGroup'), { disabled: true, style, ...p }, () => [
      h(Checkbox, { value: '1' }, () => '选项1'),
      h(Checkbox, { value: '2' }, () => '选项2')
    ])
  }
  if (type === 'ASelect') {
    const Option = resolveComp('ASelectOption')
    return h(resolveComp('ASelect'), { disabled: true, style: widthFull, ...p }, () => [
      h(Option, { value: '1' }, () => '选项1'),
      h(Option, { value: '2' }, () => '选项2')
    ])
  }
  if (type === 'ATabs') {
    const TabPane = resolveComp('ATabPane')
    return h(resolveComp('ATabs'), { ...p }, () => [
      h(TabPane, { key: '1', tab: '标签1' }, () => '内容1'),
      h(TabPane, { key: '2', tab: '标签2' }, () => '内容2')
    ])
  }
  if (type === 'AMenu') {
    const MenuItem = resolveComp('AMenuItem')
    return h(resolveComp('AMenu'), { mode: 'inline', disabled: true, style, ...p }, () => [
      h(MenuItem, { key: '1' }, () => '菜单项1'),
      h(MenuItem, { key: '2' }, () => '菜单项2')
    ])
  }
  if (type === 'ASteps') {
    const Step = resolveComp('AStep')
    return h(resolveComp('ASteps'), { current: 0, style, ...p }, () => [
      h(Step, { title: '步骤1' }),
      h(Step, { title: '步骤2' }),
      h(Step, { title: '步骤3' })
    ])
  }
  if (type === 'ABreadcrumb') {
    const Item = resolveComp('ABreadcrumbItem')
    return h(resolveComp('ABreadcrumb'), { style, ...p }, () => [
      h(Item, {}, () => '首页'),
      h(Item, {}, () => '列表'),
    ])
  }
  if (type === 'AButtonGroup') {
    return null
  }
  if (type === 'AButton') {
    return h(resolveComp('AButton'), { disabled: true, style, ...p }, () => p.label || '按钮')
  }
  if (type === 'ATag') {
    return h(resolveComp('ATag'), { style, ...p }, () => '标签')
  }
  if (type === 'AAvatar') {
    return h(resolveComp('AAvatar'), { style, ...p }, () => 'U')
  }
  if (type === 'AStatistic') {
    return h(resolveComp('AStatistic'), { style, ...p, value: 1234 }, () => null)
  }
  if (type === 'ACard') {
    return h(resolveComp('ACard'), { style, ...p }, () => h('div', { style: { padding: '16px', color: '#999' } }, '卡片内容'))
  }
  if (type === 'AAlert') {
    return h(resolveComp('AAlert'), { style, ...p, message: p.message || '提示信息' })
  }
  if (type === 'AProgress') {
    return h(resolveComp('AProgress'), { style, ...p, percent: 60 })
  }
  if (type === 'ASkeleton') {
    return h(resolveComp('ASkeleton'), { style, ...p, active: true })
  }
  if (type === 'AResult') {
    return h(resolveComp('AResult'), { style, ...p, title: '操作成功' })
  }
  if (type === 'APagination') {
    return h(resolveComp('APagination'), { style, ...p, total: 100, pageSize: 10 })
  }
  if (type === 'ATable') {
    const columns = [
      { title: '列1', dataIndex: 'col1', key: 'col1' },
      { title: '列2', dataIndex: 'col2', key: 'col2' },
    ]
    const dataSource = [{ key: '1', col1: '数据1', col2: '数据2' }]
    return h(resolveComp('ATable'), { columns, dataSource, size: 'small', pagination: false, style, ...p })
  }
  if (type === 'AList') {
    const Item = resolveComp('AListItem')
    return h(resolveComp('AList'), { style, ...p }, () => [
      h(Item, {}, () => '列表项1'),
      h(Item, {}, () => '列表项2'),
    ])
  }
  if (type === 'ADescriptions') {
    const Item = resolveComp('ADescriptionsItem')
    return h(resolveComp('ADescriptions'), { style, column: 2, ...p }, () => [
      h(Item, { label: '标签1' }, () => '内容1'),
      h(Item, { label: '标签2' }, () => '内容2'),
    ])
  }
  if (type === 'ATree') {
    const treeData = [
      { title: '节点1', key: '1' },
      { title: '节点2', key: '2', children: [{ title: '子节点', key: '2-1' }] },
    ]
    return h(resolveComp('ATree'), { treeData, defaultExpandAll: true, style, ...p })
  }
  if (type === 'ATransfer') {
    const dataSource = [
      { key: '1', title: '选项1' },
      { key: '2', title: '选项2' },
      { key: '3', title: '选项3' },
    ]
    return h(resolveComp('ATransfer'), { dataSource, targetKeys: ['1'], style, ...p })
  }
  if (type === 'ASpin') {
    return h(resolveComp('ASpin'), { style, ...p }, () => h('div', { style: { padding: '16px' } }, '内容区域'))
  }
  if (type === 'AUpload') {
    return h(resolveComp('AUpload'), { disabled: true, style }, () => h('div', { style: { padding: '16px', textAlign: 'center', border: '1px dashed #d9d9d9', borderRadius: '4px' } }, '点击上传'))
  }
  if (type === 'ADivider') {
    return h(resolveComp('ADivider'), { style, ...p })
  }

  const Component = resolveComp(type)
  if (typeof Component === 'string') {
    return h('div', { style: { padding: '8px 12px', color: '#666', fontSize: '12px', textAlign: 'center', border: '1px dashed #d9d9d9', borderRadius: '4px' } }, `[${type}]`)
  }

  const widthTypes = ['ADatePicker', 'ATimePicker', 'ACascader', 'ATreeSelect', 'AInputNumber']
  const finalStyle = widthTypes.includes(type) ? widthFull : style

  return h(Component, {
    disabled: true,
    style: finalStyle,
    placeholder: p.placeholder || getDefaultPlaceholder(type),
    ...p
  })
})

function getDefaultPlaceholder(type: string): string {
  const map: Record<string, string> = {
    AInput: '请输入',
    AInputPassword: '请输入密码',
    ATextArea: '请输入',
    AInputNumber: '请输入',
    ASelect: '请选择',
    ACascader: '请选择',
    ADatePicker: '请选择日期',
    ATimePicker: '请选择时间',
    ATreeSelect: '请选择',
    AAutoComplete: '请输入',
    AMentions: '请输入',
  }
  return map[type] || ''
}

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