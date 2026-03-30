<template>
  <div class="palette">
    <div class="palette-search">
      <input
        type="text"
        class="palette-search-input"
        :placeholder="t.palette.search"
        v-model="searchText"
      />
    </div>
    <div class="palette-categories">
      <div v-for="cat in filteredCategories" :key="cat.name" class="palette-category">
        <div class="palette-category-header" @click="toggleCategory(cat.name)">
          <span class="palette-category-arrow">{{ collapsedCategories.has(cat.name) ? '▶' : '▼' }}</span>
          <span class="palette-category-name">{{ getCategoryLabel(cat.name) }}</span>
          <span class="palette-category-count">{{ cat.prototypes.length }}</span>
        </div>
        <div v-show="!collapsedCategories.has(cat.name)" class="palette-items">
          <div
            v-for="proto in cat.prototypes"
            :key="proto.type"
            class="palette-item"
            draggable="true"
            @dragstart="onDragStart($event, proto)"
            @dragend="onDragEnd"
          >
            <span class="palette-item-icon">{{ proto.icon }}</span>
            <span class="palette-item-label">{{ getComponentLabel(proto.type) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import type { FieldPrototype } from '../types'
import { getAllPrototypes, initDefaultPrototypes, getCategories } from '../registry/componentRegistry'
import { useLocale } from '../i18n'

initDefaultPrototypes()

const { locale, t } = useLocale()
const searchText = ref('')
const collapsedCategories = reactive(new Set<string>())

function getCategoryLabel(name: string): string {
  const labels: Record<string, Record<string, string>> = {
    'zh-CN': { layout: '布局组件', basic: '基础组件', selection: '选择组件', date: '日期组件', advanced: '高级组件' },
    'en-US': { layout: 'Layout', basic: 'Basic', selection: 'Selection', date: 'Date', advanced: 'Advanced' }
  }
  return labels[locale.value]?.[name] || name
}

function getComponentLabel(type: string): string {
  return t.value.components?.[type] || type
}

const filteredCategories = computed(() => {
  const cats = getCategories()
  return cats.map(catName => {
    const protos = getAllPrototypes().filter(p => p.category === catName)
    const filtered = searchText.value
      ? protos.filter(p => p.label.includes(searchText.value) || p.type.toLowerCase().includes(searchText.value.toLowerCase()))
      : protos
    return {
      name: catName,
      prototypes: filtered
    }
  }).filter(cat => cat.prototypes.length > 0)
})

function toggleCategory(name: string) {
  if (collapsedCategories.has(name)) {
    collapsedCategories.delete(name)
  } else {
    collapsedCategories.add(name)
  }
}

function onDragStart(event: DragEvent, prototype: FieldPrototype) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify({ source: 'palette', type: prototype.type }))
    event.dataTransfer.effectAllowed = 'copy'
  }
  emit('dragStart', prototype)
}

function onDragEnd() {
  emit('dragEnd')
}

const emit = defineEmits<{
  dragStart: [prototype: FieldPrototype]
  dragEnd: []
}>()
</script>

<style scoped>
.palette { height: 100%; display: flex; flex-direction: column; background: #fff; }
.palette-search { padding: 8px; border-bottom: 1px solid #f0f0f0; }
.palette-search-input { width: 100%; padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; box-sizing: border-box; }
.palette-search-input:focus { border-color: #1890ff; outline: none; }
.palette-categories { flex: 1; overflow-y: auto; padding: 4px 0; }
.palette-category-header { display: flex; align-items: center; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 13px; font-weight: 500; color: #333; }
.palette-category-header:hover { background: #f5f5f5; }
.palette-category-arrow { font-size: 10px; margin-right: 6px; color: #999; }
.palette-category-name { flex: 1; }
.palette-category-count { font-size: 11px; color: #999; background: #f0f0f0; padding: 0 6px; border-radius: 8px; }
.palette-items { padding: 2px 8px 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.palette-item { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border: 1px solid #f0f0f0; border-radius: 4px; cursor: grab; font-size: 12px; color: #333; background: #fafafa; transition: all 0.15s; }
.palette-item:hover { border-color: #1890ff; background: #e6f7ff; }
.palette-item:active { cursor: grabbing; }
.palette-item-icon { font-size: 14px; }
.palette-item-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>