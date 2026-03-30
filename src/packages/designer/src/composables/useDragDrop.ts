import { ref } from 'vue'
import type { DesignNode, DragData, DropPosition, FieldPrototype } from '../types'

export function useDragDrop() {
  const isDragging = ref(false)
  const dragData = ref<DragData | null>(null)
  const dropTargetId = ref<string | null>(null)
  const dropPosition = ref<DropPosition | null>(null)

  function startPaletteDrag(prototype: FieldPrototype): void {
    isDragging.value = true
    dragData.value = { source: 'palette', typeOrId: prototype.type, prototype }
  }

  function startCanvasDrag(nodeId: string): void {
    isDragging.value = true
    dragData.value = { source: 'canvas', typeOrId: nodeId }
  }

  function setDropTarget(nodeId: string, position: DropPosition): void {
    dropTargetId.value = nodeId
    dropPosition.value = position
  }

  function clearDropTarget(): void {
    dropTargetId.value = null
    dropPosition.value = null
  }

  function endDrag(): void {
    isDragging.value = false
    dragData.value = null
    clearDropTarget()
  }

  function getDropPosition(event: DragEvent, element: HTMLElement): DropPosition {
    const rect = element.getBoundingClientRect()
    const y = event.clientY - rect.top
    const ratio = y / rect.height
    if (ratio < 0.25) return 'before'
    if (ratio > 0.75) return 'after'
    return 'inside'
  }

  return {
    isDragging,
    dragData,
    dropTargetId,
    dropPosition,
    startPaletteDrag,
    startCanvasDrag,
    setDropTarget,
    clearDropTarget,
    endDrag,
    getDropPosition
  }
}