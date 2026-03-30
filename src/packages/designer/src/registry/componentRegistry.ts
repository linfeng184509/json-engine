import type { FieldPrototype } from '../types'
import { defaultPrototypes } from './fieldPrototypes'

export interface ComponentRegistry {
  prototypes: Map<string, FieldPrototype>
}

const registry: ComponentRegistry = {
  prototypes: new Map()
}

export function registerPrototype(prototype: FieldPrototype): void {
  registry.prototypes.set(prototype.type, prototype)
}

export function getPrototype(type: string): FieldPrototype | undefined {
  return registry.prototypes.get(type)
}

export function getAllPrototypes(): FieldPrototype[] {
  return Array.from(registry.prototypes.values())
}

export function getPrototypesByCategory(category: string): FieldPrototype[] {
  return getAllPrototypes().filter(p => p.category === category)
}

export function getCategories(): string[] {
  const categories = new Set<string>()
  for (const proto of registry.prototypes.values()) {
    categories.add(proto.category)
  }
  return Array.from(categories)
}

export function initDefaultPrototypes(): void {
  for (const proto of defaultPrototypes) {
    registerPrototype(proto)
  }
}

export { registry }
