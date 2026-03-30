<template>
  <div class="property-panel">
    <div v-if="!selectedNode" class="property-panel-empty">
      <p>{{ t.property.selectHint }}</p>
    </div>
    <div v-else class="property-panel-content">
      <div class="property-panel-header">
        <span class="property-panel-icon">{{ selectedNode.designerMeta?.icon || '📦' }}</span>
        <span class="property-panel-type">{{ getComponentLabel(selectedNode.type) }}</span>
        <button v-if="!selectedNode.locked" class="property-delete-btn" @click="emit('delete', selectedNode.id)">🗑️ {{ t.property.delete }}</button>
      </div>
      <div class="property-tabs">
        <div v-for="tab in dynamicTabs" :key="tab.key" class="property-tab" :class="{ 'property-tab--active': activeTab === tab.key }" @click="activeTab = tab.key">
          {{ tab.label }}
        </div>
      </div>
      <div class="property-tab-content">
        <template v-if="activeTab === 'props'">
          <div v-for="group in groupedEditors" :key="group.name" class="property-group">
            <div class="property-group-header" @click="toggleGroup(group.name)">
              <span>{{ groupLabels[group.name as keyof typeof groupLabels.value] || group.name }}</span>
              <span>{{ collapsedGroups.has(group.name) ? '▶' : '▼' }}</span>
            </div>
            <div v-show="!collapsedGroups.has(group.name)" class="property-group-content">
              <template v-for="editor in group.editors" :key="editor.name">
                <StringSetter v-if="editor.setter === 'string'" :label="editor.label" :model-value="getPropValue(editor.name) as string" :placeholder="editor.placeholder" :help="editor.help" @update:model-value="setPropValue(editor.name, $event)" />
                <NumberSetter v-else-if="editor.setter === 'number'" :label="editor.label" :model-value="getPropValue(editor.name) as number" :placeholder="editor.placeholder" :help="editor.help" @update:model-value="setPropValue(editor.name, $event)" />
                <BooleanSetter v-else-if="editor.setter === 'boolean'" :label="editor.label" :model-value="getPropValue(editor.name) as boolean" @update:model-value="setPropValue(editor.name, $event)" />
                <SelectSetter v-else-if="editor.setter === 'select'" :label="editor.label" :model-value="getPropValue(editor.name)" :options="editor.options || []" @update:model-value="setPropValue(editor.name, $event)" />
                <ExpressionSetter v-else-if="editor.setter === 'expression'" :label="editor.label" :model-value="getPropValue(editor.name) as string" :placeholder="editor.placeholder" :help="editor.help" @update:model-value="setPropValue(editor.name, $event)" />
                <StringSetter v-else-if="editor.setter === 'json'" :label="editor.label" :model-value="getPropValue(editor.name) as string" :placeholder="editor.placeholder" :help="editor.help" @update:model-value="setPropValue(editor.name, $event)" />
              </template>
            </div>
          </div>
        </template>
        <template v-else-if="activeTab === 'style'">
          <StyleSetter :model-value="selectedNode.style" @update:model-value="setStyle" />
        </template>
        <template v-else-if="activeTab === 'events'">
          <EventSetter :model-value="selectedNode.events" :component-type="selectedNode.type" @update:model-value="setEvents" />
        </template>
        <template v-else-if="activeTab === 'lifecycle'">
          <LifecycleSetter :model-value="selectedNode.lifecycle" @update:model-value="setLifecycle" />
        </template>
        <template v-else-if="activeTab === 'dependency'">
          <DependencySetter :model-value="selectedNode.dependencies" :other-fields="otherFields" @update:model-value="setDependencies" />
        </template>
        <template v-else-if="activeTab === 'i18n'">
          <I18nSetter :node-type="selectedNode.type" :props="selectedNode.props" :i18n="selectedNode.i18n" @update:i18n="setI18n" />
        </template>
        <template v-else-if="activeTab === 'datasource'">
          <DataSourceSetter :model-value="selectedNode.dataSource" :apis="apis" @update:model-value="setDataSource" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { DesignNode, PropEditorDef, ApiEndpoint, DataSourceRef } from '../types'
import { useLocale } from '../i18n'
import StringSetter from '../setters/StringSetter.vue'
import NumberSetter from '../setters/NumberSetter.vue'
import BooleanSetter from '../setters/BooleanSetter.vue'
import SelectSetter from '../setters/SelectSetter.vue'
import ExpressionSetter from '../setters/ExpressionSetter.vue'
import StyleSetter from '../setters/StyleSetter.vue'
import EventSetter from '../setters/EventSetter.vue'
import LifecycleSetter from '../setters/LifecycleSetter.vue'
import DependencySetter from '../setters/DependencySetter.vue'
import I18nSetter from '../setters/I18nSetter.vue'
import DataSourceSetter from '../setters/DataSourceSetter.vue'

const { locale, t } = useLocale()

const props = defineProps<{
  selectedNode: DesignNode | null
  allNodes?: DesignNode[]
  apis?: ApiEndpoint[]
}>()

const emit = defineEmits<{
  updateProp: [nodeId: string, name: string, value: unknown]
  updateStyle: [nodeId: string, style: Record<string, string>]
  updateEvents: [nodeId: string, events: Record<string, string>]
  updateLifecycle: [nodeId: string, lifecycle: Record<string, string>]
  updateDependencies: [nodeId: string, dependencies: Record<string, unknown>]
  updateI18n: [nodeId: string, i18n: Record<string, Record<string, string>>]
  updateDataSource: [nodeId: string, dataSource: DataSourceRef | undefined]
  delete: [nodeId: string]
}>()

const activeTab = ref('props')
const collapsedGroups = reactive(new Set<string>())

function getComponentLabel(type: string): string {
  return t.value.components?.[type] || type
}

const dynamicTabs = computed(() => [
  { key: 'props', label: t.value.property.tabs.props },
  { key: 'style', label: t.value.property.tabs.style },
  { key: 'events', label: t.value.property.tabs.events },
  { key: 'lifecycle', label: t.value.property.tabs.lifecycle },
  { key: 'dependency', label: t.value.property.tabs.dependency },
  { key: 'i18n', label: '🌐 ' + (t.value.property.tabs.i18n || '翻译') },
  { key: 'datasource', label: '📡 数据源' },
])

const tabs = [
  { key: 'props', label: '属性' },
  { key: 'style', label: '样式' },
  { key: 'events', label: '事件' },
  { key: 'lifecycle', label: '生命周期' },
  { key: 'dependency', label: '联动' },
]

const groupLabels = computed(() => ({
  basic: t.value.property.groups.basic,
  validation: t.value.property.groups.validation,
  layout: t.value.property.groups.layout,
  style: t.value.property.groups.style
}))

const groupedEditors = computed(() => {
  if (!props.selectedNode?.designerMeta?.propEditors) return []
  const editors = props.selectedNode.designerMeta.propEditors
  const groups: Record<string, PropEditorDef[]> = {}
  for (const editor of editors) {
    const groupName = editor.group || 'basic'
    if (!groups[groupName]) groups[groupName] = []
    groups[groupName].push(editor)
  }
  return Object.entries(groups).map(([name, editors]) => ({ name, editors }))
})

function getPropValue(name: string): unknown {
  if (!props.selectedNode?.props) return undefined
  return props.selectedNode.props[name]
}

function setPropValue(name: string, value: unknown) {
  if (!props.selectedNode) return
  emit('updateProp', props.selectedNode.id, name, value)
}

function setStyle(style: Record<string, string>) {
  if (!props.selectedNode) return
  emit('updateStyle', props.selectedNode.id, style)
}

function setEvents(events: Record<string, string>) {
  if (!props.selectedNode) return
  emit('updateEvents', props.selectedNode.id, events)
}

function setLifecycle(lifecycle: Record<string, string>) {
  if (!props.selectedNode) return
  emit('updateLifecycle', props.selectedNode.id, lifecycle)
}

function setDependencies(deps: Record<string, unknown>) {
  if (!props.selectedNode) return
  emit('updateDependencies', props.selectedNode.id, deps)
}

function setI18n(i18n: Record<string, Record<string, string>>) {
  if (!props.selectedNode) return
  emit('updateI18n', props.selectedNode.id, i18n)
}

function setDataSource(dataSource: DataSourceRef | undefined) {
  if (!props.selectedNode) return
  emit('updateDataSource', props.selectedNode.id, dataSource)
}

interface FieldInfo {
  id: string
  label: string
  type: string
  binding: string
}

function collectFields(node: DesignNode, result: FieldInfo[], currentId: string) {
  if (node.id === currentId) return
  const binding = node.props?.['v-model:value'] as string || node.props?.['v-model:checked'] as string || ''
  const name = node.props?.name as string || node.props?.label as string || node.label || node.type
  if (binding && binding.includes('$state')) {
    result.push({
      id: node.id,
      label: String(name),
      type: node.type,
      binding: binding.replace('$state.', '')
    })
  }
  if (node.children) {
    for (const child of node.children) {
      collectFields(child, result, currentId)
    }
  }
}

const otherFields = computed(() => {
  if (!props.selectedNode || !props.allNodes) return []
  const result: FieldInfo[] = []
  for (const root of props.allNodes) {
    collectFields(root, result, props.selectedNode.id)
  }
  return result
})

function toggleGroup(name: string) {
  if (collapsedGroups.has(name)) {
    collapsedGroups.delete(name)
  } else {
    collapsedGroups.add(name)
  }
}
</script>

<style scoped>
.property-panel { height: 100%; overflow-y: auto; background: #fff; }
.property-panel-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 13px; }
.property-panel-content { padding: 12px; }
.property-panel-header { display: flex; align-items: center; gap: 6px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; margin-bottom: 8px; }
.property-panel-icon { font-size: 18px; }
.property-panel-type { font-size: 14px; font-weight: 500; color: #333; }
.property-tabs { display: flex; border-bottom: 1px solid #f0f0f0; margin-bottom: 12px; }
.property-tab { flex: 1; padding: 8px 0; text-align: center; font-size: 12px; color: #666; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
.property-tab:hover { color: #1890ff; }
.property-tab--active { color: #1890ff; border-bottom-color: #1890ff; font-weight: 500; }
.property-tab-content { min-height: 200px; }
.property-group { margin-bottom: 8px; }
.property-group-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: #fafafa; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; color: #666; user-select: none; }
.property-group-header:hover { background: #f0f0f0; }
.property-group-content { padding: 8px 4px; }
.property-delete-btn { margin-left: auto; padding: 2px 8px; border: 1px solid #ff4d4f; background: #fff; color: #ff4d4f; border-radius: 4px; cursor: pointer; font-size: 11px; }
.property-delete-btn:hover { background: #ff4d4f; color: #fff; }
</style>