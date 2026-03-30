<template>
  <div 
    class="canvas" 
    ref="canvasRef"
    @wheel="onWheel"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <div class="canvas-viewport" :style="viewportStyle">
      <div class="canvas-wrapper" :style="wrapperStyle">
        <div class="canvas-inner" @click="onCanvasClick">
          <CanvasNode
            :node="tree"
            :selected-id="selectedNodeId"
            :drop-target-id="dropTargetId"
            :drop-position="dropPosition"
            @select="emit('select', $event)"
            @drop-node="onDropNode"
            @context-menu="onContextMenu"
          />
        </div>
      </div>
    </div>
    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <div class="context-menu-item" @click="onContextAction('delete')">删除</div>
      <div class="context-menu-item" @click="onContextAction('duplicate')">复制</div>
      <div class="context-menu-item" @click="onContextAction('moveUp')">上移</div>
      <div class="context-menu-item" @click="onContextAction('moveDown')">下移</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import type { DesignNode, DropPosition } from '../types'
import CanvasNode from './CanvasNode.vue'

const props = defineProps<{
  tree: DesignNode
  selectedNodeId: string | null
  dropTargetId: string | null
  dropPosition: DropPosition | null
  viewportWidth?: number
  viewportHeight?: number
  scale?: number
  panX?: number
  panY?: number
}>()

const emit = defineEmits<{
  select: [id: string | null]
  drop: [targetId: string, position: DropPosition, data: string]
  contextAction: [action: string, nodeId: string]
  'pan-start': [e: MouseEvent]
  'pan-move': [e: MouseEvent]
  'pan-end': []
}>()

const canvasRef = ref<HTMLElement | null>(null)
const contextMenu = reactive({ visible: false, x: 0, y: 0, nodeId: '' })
const isPanning = ref(false)

const viewportStyle = computed(() => ({
  transform: `scale(${props.scale || 1}) translate(${props.panX || 0}px, ${props.panY || 0}px)`,
  transformOrigin: 'center center',
  cursor: isPanning.value ? 'grabbing' : 'grab'
}))

const wrapperStyle = computed(() => ({
  width: `${props.viewportWidth || 1440}px`,
  height: `${props.viewportHeight || 900}px`
}))

function onWheel(e: WheelEvent) {
  if (e.ctrlKey) {
    e.preventDefault()
  }
}

function onMouseDown(e: MouseEvent) {
  if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-viewport')) {
    isPanning.value = true
    emit('pan-start', e)
  }
}

function onMouseMove(e: MouseEvent) {
  if (isPanning.value) {
    emit('pan-move', e)
  }
}

function onMouseUp() {
  if (isPanning.value) {
    isPanning.value = false
    emit('pan-end')
  }
}

function onCanvasClick(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('.canvas-wrapper')) return
  emit('select', null)
  hideContextMenu()
}

function onDropNode(targetId: string, position: DropPosition, data: string) {
  emit('drop', targetId, position, data)
}

function onContextMenu(nodeId: string, x: number, y: number) {
  contextMenu.visible = true
  contextMenu.x = x
  contextMenu.y = y
  contextMenu.nodeId = nodeId
}

function hideContextMenu() {
  contextMenu.visible = false
}

function onContextAction(action: string) {
  emit('contextAction', action, contextMenu.nodeId)
  hideContextMenu()
}
</script>

<style scoped>
.canvas { position: absolute; inset: 0; overflow: auto; background: #f0f2f5; box-sizing: border-box; }
.canvas-viewport { min-width: min-content; min-height: 100%; display: flex; justify-content: center; align-items: flex-start; padding: 16px; box-sizing: border-box; will-change: transform; transition: transform 0.1s ease-out; }
.canvas-wrapper { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.12); overflow: auto; flex-shrink: 0; }
.canvas-inner { width: 100%; min-height: 100%; padding: 16px; box-sizing: border-box; }
.canvas-empty { text-align: center; color: #999; padding: 60px 20px; font-size: 14px; }
.context-menu { position: fixed; background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1000; min-width: 100px; }
.context-menu-item { padding: 8px 16px; cursor: pointer; font-size: 13px; }
.context-menu-item:hover { background: #e6f7ff; color: #1890ff; }
</style>