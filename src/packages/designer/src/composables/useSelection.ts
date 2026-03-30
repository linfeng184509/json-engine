import { ref, computed } from 'vue'
import type { DesignNode } from '../types'
import { findNode } from '../utils/treeOperations'

export function useSelection() {
  const selectedNodeId = ref<string | null>(null)

  function selectNode(id: string | null): void {
    selectedNodeId.value = id
  }

  function deselectAll(): void {
    selectedNodeId.value = null
  }

  function isSelected(id: string): boolean {
    return selectedNodeId.value === id
  }

  function getSelectedNode(tree: DesignNode): DesignNode | null {
    if (!selectedNodeId.value) return null
    return findNode(tree, selectedNodeId.value)
  }

  return {
    selectedNodeId,
    selectNode,
    deselectAll,
    isSelected,
    getSelectedNode
  }
}