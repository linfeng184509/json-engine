import { ref, computed } from 'vue'

export interface UseZoomOptions {
  min?: number
  max?: number
  step?: number
}

export function useZoom(options: UseZoomOptions = {}) {
  const { min = 0.5, max = 2, step = 0.1 } = options

  const scale = ref(1)
  const panX = ref(0)
  const panY = ref(0)
  const isDragging = ref(false)
  const dragStart = ref({ x: 0, y: 0, panX: 0, panY: 0 })

  const scalePercent = computed({
    get: () => Math.round(scale.value * 100),
    set: (val: number) => { scale.value = Math.max(min, Math.min(max, val / 100)) }
  })

  function zoomIn() {
    scale.value = Math.min(scale.value + step, max)
  }

  function zoomOut() {
    scale.value = Math.max(scale.value - step, min)
  }

  function setZoom(value: number) {
    scale.value = Math.max(min, Math.min(max, value))
  }

  function reset() {
    scale.value = 1
    panX.value = 0
    panY.value = 0
  }

  function startDrag(e: MouseEvent) {
    isDragging.value = true
    dragStart.value = {
      x: e.clientX,
      y: e.clientY,
      panX: panX.value,
      panY: panY.value
    }
  }

  function onDrag(e: MouseEvent) {
    if (!isDragging.value) return
    panX.value = dragStart.value.panX + (e.clientX - dragStart.value.x) / scale.value
    panY.value = dragStart.value.panY + (e.clientY - dragStart.value.y) / scale.value
  }

  function endDrag() {
    isDragging.value = false
  }

  function onWheel(e: WheelEvent) {
    if (!e.ctrlKey) return
    e.preventDefault()
    if (e.deltaY > 0) {
      zoomOut()
    } else {
      zoomIn()
    }
  }

  function fitToWidth(containerWidth: number, contentWidth: number) {
    scale.value = Math.max(min, Math.min(max, containerWidth / contentWidth))
    panX.value = 0
    panY.value = 0
  }

  return {
    scale,
    scalePercent,
    panX,
    panY,
    isDragging,
    zoomIn,
    zoomOut,
    setZoom,
    reset,
    startDrag,
    onDrag,
    endDrag,
    onWheel,
    fitToWidth
  }
}