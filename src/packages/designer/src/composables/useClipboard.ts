import { ref } from 'vue'
import type { DesignNode } from '../types'
import { findNode, deepCloneNode, insertNode, generateId } from '../utils/treeOperations'

export function useClipboard() {
  const clipboard = ref<DesignNode | null>(null)

  function copy(tree: DesignNode, id: string): void {
    const node = findNode(tree, id)
    if (node && !node.locked) {
      clipboard.value = deepCloneNode(node)
    }
  }

  function paste(tree: DesignNode, parentId: string): DesignNode | null {
    if (!clipboard.value) return null
    const clone = deepCloneNode(clipboard.value)
    insertNode(tree, parentId, clone)
    return clone
  }

  function hasClipboard(): boolean {
    return clipboard.value !== null
  }

  function clear(): void {
    clipboard.value = null
  }

  return {
    clipboard,
    copy,
    paste,
    hasClipboard,
    clear
  }
}