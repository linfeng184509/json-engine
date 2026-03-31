import type { Component } from 'vue'
import StringSetter from './StringSetter.vue'
import NumberSetter from './NumberSetter.vue'
import BooleanSetter from './BooleanSetter.vue'
import SelectSetter from './SelectSetter.vue'
import ExpressionSetter from './ExpressionSetter.vue'
import JsonSetter from './JsonSetter.vue'
import I18nSetter from './I18nSetter.vue'

export type EditorType = 'string' | 'number' | 'boolean' | 'select' | 'expression' | 'json' | 'i18n'

export interface SetterProps {
  label?: string
  modelValue?: unknown
  placeholder?: string
  help?: string
  type?: string
  required?: boolean
  validator?: { type: 'function'; params: string; body: string }
  options?: { label: string; value: unknown }[]
  disabled?: boolean
}

export const setterRegistry: Record<EditorType, Component> = {
  string: StringSetter,
  number: NumberSetter,
  boolean: BooleanSetter,
  select: SelectSetter,
  expression: ExpressionSetter,
  json: JsonSetter,
  i18n: I18nSetter,
}

export function getSetterComponent(editor?: EditorType): Component {
  if (editor && setterRegistry[editor]) {
    return setterRegistry[editor]
  }
  return StringSetter
}

export function inferEditorType(type?: string): EditorType {
  if (!type) return 'string'

  const typeMap: Record<string, EditorType> = {
    String: 'string',
    Number: 'number',
    Boolean: 'boolean',
    Array: 'json',
    Object: 'json',
    Function: 'expression',
  }

  return typeMap[type] || 'string'
}
