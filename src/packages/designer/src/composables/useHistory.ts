import { ref, shallowRef } from 'vue'
import type { DesignNode } from '../types'

const MAX_HISTORY = 50

export function useHistory() {
  const undoStack = shallowRef<DesignNode[]>([])
  const redoStack = shallowRef<DesignNode[]>([])

  function pushState(state: DesignNode): void {
    const stack = [...undoStack.value, state]
    if (stack.length > MAX_HISTORY) {
      stack.shift()
    }
    undoStack.value = stack
    redoStack.value = []
  }

  function undo(currentState: DesignNode): DesignNode | null {
    if (undoStack.value.length === 0) return null
    const stack = [...undoStack.value]
    const previous = stack.pop()!
    undoStack.value = stack
    redoStack.value = [...redoStack.value, currentState]
    return previous
  }

  function redo(currentState: DesignNode): DesignNode | null {
    if (redoStack.value.length === 0) return null
    const stack = [...redoStack.value]
    const next = stack.pop()!
    redoStack.value = stack
    undoStack.value = [...undoStack.value, currentState]
    return next
  }

  function canUndo(): boolean {
    return undoStack.value.length > 0
  }

  function canRedo(): boolean {
    return redoStack.value.length > 0
  }

  function clear(): void {
    undoStack.value = []
    redoStack.value = []
  }

  return {
    undoStack,
    redoStack,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear
  }
}