import type { DesignNode, DropPosition } from '../types'

/**
 * Generate a unique ID for design nodes
 */
export function generateId(): string {
  return 'n_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
}

/**
 * Deep clone a DesignNode, generating new IDs for all nodes
 */
export function deepCloneNode(node: DesignNode): DesignNode {
  const cloned: DesignNode = {
    ...node,
    id: generateId(),
    props: node.props ? { ...node.props } : undefined,
    designerMeta: node.designerMeta ? { ...node.designerMeta } : undefined
  }
  if (node.children) {
    cloned.children = node.children.map(child => deepCloneNode(child))
  }
  if (node.slots) {
    cloned.slots = {}
    for (const [name, slotNodes] of Object.entries(node.slots)) {
      cloned.slots[name] = slotNodes.map(child => deepCloneNode(child))
    }
  }
  return cloned
}

/**
 * Find a node by ID in the tree (recursive)
 * Returns the node or null if not found
 */
export function findNode(tree: DesignNode, id: string): DesignNode | null {
  if (tree.id === id) return tree
  if (tree.children) {
    for (const child of tree.children) {
      const found = findNode(child, id)
      if (found) return found
    }
  }
  if (tree.slots) {
    for (const slotNodes of Object.values(tree.slots)) {
      for (const child of slotNodes) {
        const found = findNode(child, id)
        if (found) return found
      }
    }
  }
  return null
}

/**
 * Find the parent of a node by child ID
 */
export function findParentNode(tree: DesignNode, childId: string): { parent: DesignNode; index: number; slotName?: string } | null {
  if (tree.children) {
    for (let i = 0; i < tree.children.length; i++) {
      if (tree.children[i].id === childId) {
        return { parent: tree, index: i }
      }
      const found = findParentNode(tree.children[i], childId)
      if (found) return found
    }
  }
  if (tree.slots) {
    for (const [slotName, slotNodes] of Object.entries(tree.slots)) {
      for (let i = 0; i < slotNodes.length; i++) {
        if (slotNodes[i].id === childId) {
          return { parent: tree, index: i, slotName }
        }
        const found = findParentNode(slotNodes[i], childId)
        if (found) return found
      }
    }
  }
  return null
}

/**
 * Insert a node as a child of a container node
 */
export function insertNode(tree: DesignNode, parentId: string, node: DesignNode, index?: number): DesignNode {
  const parent = findNode(tree, parentId)
  if (!parent) {
    throw new Error(`Parent node not found: ${parentId}`)
  }
  if (!parent.children) {
    parent.children = []
  }
  if (index !== undefined && index >= 0) {
    parent.children.splice(index, 0, node)
  } else {
    parent.children.push(node)
  }
  return tree
}

/**
 * Remove a node from the tree by ID
 * Prevents removal of locked nodes and root node
 */
export function removeNode(tree: DesignNode, id: string): DesignNode | null {
  if (tree.id === id) return null
  const node = findNode(tree, id)
  if (!node || node.locked) return null

  const result = findParentNode(tree, id)
  if (!result) return null

  const { parent, index, slotName } = result
  if (slotName && parent.slots && parent.slots[slotName]) {
    return parent.slots[slotName].splice(index, 1)[0]
  }
  if (parent.children) {
    return parent.children.splice(index, 1)[0]
  }
  return null
}

/**
 * Move a node to a new position in the tree
 */
export function moveNode(tree: DesignNode, sourceId: string, targetId: string, position: DropPosition): DesignNode {
  if (sourceId === targetId) return tree

  const sourceNode = findNode(tree, sourceId)
  if (!sourceNode || sourceNode.locked) return tree

  if (position === 'inside' && findNode(sourceNode, targetId)) {
    return tree
  }

  const removed = removeNode(tree, sourceId)
  if (!removed) return tree

  if (position === 'inside') {
    insertNode(tree, targetId, removed)
  } else {
    const result = findParentNode(tree, targetId)
    if (!result) {
      insertNode(tree, tree.id, removed)
      return tree
    }
    const { parent, index } = result
    const insertIndex = position === 'after' ? index + 1 : index
    if (!parent.children) parent.children = []
    parent.children.splice(insertIndex, 0, removed)
  }

  return tree
}

/**
 * Duplicate a node and insert the copy after the original
 */
export function duplicateNode(tree: DesignNode, id: string): DesignNode | null {
  if (tree.id === id) return null
  const node = findNode(tree, id)
  if (!node) return null

  const clone = deepCloneNode(node)
  const result = findParentNode(tree, id)
  if (!result) return null

  const { parent, index } = result
  if (parent.children) {
    parent.children.splice(index + 1, 0, clone)
  }
  return clone
}

/**
 * Update props on a node
 */
export function updateNodeProps(tree: DesignNode, id: string, props: Record<string, unknown>): DesignNode {
  const node = findNode(tree, id)
  if (node) {
    node.props = { ...(node.props || {}), ...props }
  }
  return tree
}

/**
 * Collect all v-model binding paths from the tree
 */
export function collectVModelPaths(tree: DesignNode): string[] {
  const paths: string[] = []
  function walk(node: DesignNode) {
    if (node.props) {
      for (const [key, value] of Object.entries(node.props)) {
        if (key.startsWith('v-model:') && typeof value === 'string') {
          const match = value.match(/\$state\.(.+)/)
          if (match) {
            paths.push(match[1])
          }
        }
      }
    }
    if (node.children) {
      for (const child of node.children) walk(child)
    }
    if (node.slots) {
      for (const slotNodes of Object.values(node.slots)) {
        for (const child of slotNodes) walk(child)
      }
    }
  }
  walk(tree)
  return [...new Set(paths)]
}