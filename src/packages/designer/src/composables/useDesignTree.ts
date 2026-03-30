import { ref, computed, triggerRef } from 'vue'
import type { DesignNode, DropPosition, FieldPrototype } from '../types'
import { generateId, findNode, insertNode, removeNode, moveNode, duplicateNode, updateNodeProps, deepCloneNode } from '../utils/treeOperations'
import { useHistory } from './useHistory'
import { getPrototype, initDefaultPrototypes } from '../registry/componentRegistry'

initDefaultPrototypes()

function createDefaultTree(): DesignNode {
  const formProto = getPrototype('AForm')
  return {
    id: generateId(),
    type: 'AForm',
    label: '表单',
    locked: true,
    props: formProto?.defaultProps ? { ...formProto.defaultProps } : { layout: 'vertical' },
    children: [],
    designerMeta: {
      icon: formProto?.icon || '📋',
      category: formProto?.category || 'layout',
      propEditors: formProto?.propEditors
    }
  }
}

export function useDesignTree() {
  const tree = ref<DesignNode>(createDefaultTree())
  const history = useHistory()

  function deepClone(): DesignNode {
    return JSON.parse(JSON.stringify(tree.value))
  }

  function commitChange(): void {
    history.pushState(deepClone())
  }

  function addNode(parentId: string, prototype: FieldPrototype, index?: number): DesignNode {
    commitChange()

    const newNode: DesignNode = {
      id: generateId(),
      type: prototype.type,
      label: prototype.label,
      props: prototype.defaultProps ? { ...prototype.defaultProps } : {},
      designerMeta: {
        icon: prototype.icon,
        category: prototype.category,
        propEditors: prototype.propEditors
      }
    }

    if (prototype.defaultChildren) {
      newNode.children = prototype.defaultChildren.map(c => deepCloneNode(c))
    }

    // Handle wrapIn (e.g., AInput -> AFormItem wrapper)
    if (prototype.wrapIn) {
      const wrapProto = getPrototype(prototype.wrapIn)
      const wrapper: DesignNode = {
        id: generateId(),
        type: prototype.wrapIn,
        label: prototype.label,
        props: wrapProto?.defaultProps ? { ...wrapProto.defaultProps, label: prototype.label } : { label: prototype.label, name: '' },
        children: [newNode],
        designerMeta: {
          icon: wrapProto?.icon || '📦',
          category: wrapProto?.category || 'layout',
          propEditors: wrapProto?.propEditors
        }
      }
      insertNode(tree.value, parentId, wrapper, index)
      triggerRef(tree)
      return wrapper
    }

    insertNode(tree.value, parentId, newNode, index)
    triggerRef(tree)
    return newNode
  }

  function removeNodeById(id: string): boolean {
    if (tree.value.id === id) return false
    commitChange()
    const result = removeNode(tree.value, id)
    triggerRef(tree)
    return result !== null
  }

  function moveNodeTo(sourceId: string, targetId: string, position: DropPosition): void {
    commitChange()
    moveNode(tree.value, sourceId, targetId, position)
    triggerRef(tree)
  }

  function duplicateNodeById(id: string): DesignNode | null {
    commitChange()
    const result = duplicateNode(tree.value, id)
    triggerRef(tree)
    return result
  }

  function updateNodePropsById(id: string, props: Record<string, unknown>): void {
    commitChange()
    updateNodeProps(tree.value, id, props)
    triggerRef(tree)
  }

  function undo(): void {
    const prev = history.undo(deepClone())
    if (prev) {
      tree.value = prev
    }
  }

  function redo(): void {
    const next = history.redo(deepClone())
    if (next) {
      tree.value = next
    }
  }

  function clearTree(): void {
    commitChange()
    tree.value = createDefaultTree()
  }

  function importTree(newTree: DesignNode): void {
    commitChange()
    tree.value = newTree
  }

  return {
    tree,
    addNode,
    removeNodeById,
    moveNodeTo,
    duplicateNodeById,
    updateNodePropsById,
    undo,
    redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    clearTree,
    importTree
  }
}