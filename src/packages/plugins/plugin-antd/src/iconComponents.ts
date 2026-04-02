import type { Component } from 'vue'
import * as Icons from '@ant-design/icons-vue'

export function getAntdIconComponents(): Record<string, Component> {
  const result: Record<string, Component> = {}

  for (const [name, component] of Object.entries(Icons)) {
    if (component && (typeof component === 'function' || (typeof component === 'object' && 'render' in component))) {
      if (name !== 'default' && name !== 'createFromIconfontCN') {
        result[name] = component as Component
      }
    }
  }

  return result
}

export function getAntdIconNames(): string[] {
  return Object.keys(getAntdIconComponents())
}