<template>
  <div class="datasource-setter">
    <div class="ds-title">远程数据源</div>
    <div class="ds-field">
      <label>API 接口</label>
      <select :value="modelValue?.apiId || ''" @change="onApiChange">
        <option value="">无 (使用静态数据)</option>
        <option v-for="api in apis" :key="api.id" :value="api.id">{{ api.name }} ({{ api.method }} {{ api.url || '...' }})</option>
      </select>
    </div>
    <template v-if="modelValue?.apiId">
      <div class="ds-field">
        <label>
          <input type="checkbox" :checked="modelValue?.autoLoad" @change="onAutoLoadChange" />
          自动加载
        </label>
      </div>
      <div class="ds-field">
        <label>依赖字段 (逗号分隔)</label>
        <input type="text" :value="modelValue?.dependFields?.join(',')" @input="onDependFieldsChange" placeholder="formData.province" />
      </div>
      <div class="ds-field">
        <label>数据转换 (JS表达式)</label>
        <textarea :value="modelValue?.transform" @input="onTransformChange" rows="3" placeholder="data.map(item => ({ label: item.name, value: item.id }))"></textarea>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ApiEndpoint, DataSourceRef } from '../types'

const props = defineProps<{
  modelValue: DataSourceRef | undefined
  apis: ApiEndpoint[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DataSourceRef | undefined]
}>()

function onApiChange(event: Event) {
  const apiId = (event.target as HTMLSelectElement).value
  if (apiId) {
    emit('update:modelValue', { apiId, autoLoad: true })
  } else {
    emit('update:modelValue', undefined)
  }
}

function onAutoLoadChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  emit('update:modelValue', { ...props.modelValue!, autoLoad: checked })
}

function onDependFieldsChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  const fields = value ? value.split(',').map(s => s.trim()).filter(Boolean) : undefined
  emit('update:modelValue', { ...props.modelValue!, dependFields: fields })
}

function onTransformChange(event: Event) {
  const value = (event.target as HTMLTextAreaElement).value
  emit('update:modelValue', { ...props.modelValue!, transform: value || undefined })
}
</script>

<style scoped>
.datasource-setter { font-size: 12px; }
.ds-title { font-size: 13px; font-weight: 500; color: #333; margin-bottom: 12px; }
.ds-field { margin-bottom: 10px; }
.ds-field label { display: block; font-size: 11px; color: #999; margin-bottom: 4px; }
.ds-field input[type="checkbox"] { margin-right: 4px; }
.ds-field input, .ds-field select, .ds-field textarea { width: 100%; padding: 5px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; box-sizing: border-box; }
.ds-field input:focus, .ds-field select:focus, .ds-field textarea:focus { border-color: #1890ff; outline: none; }
.ds-field textarea { font-family: monospace; resize: vertical; }
</style>