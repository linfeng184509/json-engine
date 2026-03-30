<template>
  <div class="api-panel">
    <div class="api-header">
      <span class="api-title">API 列表</span>
      <button class="api-add-btn" @click="addApi">+ 新增</button>
    </div>
    <div class="api-list">
      <div v-for="api in apis" :key="api.id" class="api-item" :class="{ 'api-item--selected': selectedId === api.id }" @click="selectApi(api.id)">
        <div class="api-item-header">
          <span class="api-method" :class="'api-method--' + api.method.toLowerCase()">{{ api.method }}</span>
          <span class="api-name">{{ api.name }}</span>
          <button class="api-delete" @click.stop="deleteApi(api.id)">✕</button>
        </div>
        <div class="api-url">{{ api.url || '(未配置)' }}</div>
      </div>
      <div v-if="apis.length === 0" class="api-empty">暂无 API 配置</div>
    </div>
    <div v-if="selectedApi" class="api-detail">
      <div class="api-detail-title">编辑 API</div>
      <div class="api-field">
        <label>名称</label>
        <input type="text" :value="selectedApi.name" @input="updateApi('name', $event)" placeholder="API 名称" />
      </div>
      <div class="api-field">
        <label>URL</label>
        <input type="text" :value="selectedApi.url" @input="updateApi('url', $event)" placeholder="https://api.example.com/data" />
      </div>
      <div class="api-field">
        <label>方法</label>
        <select :value="selectedApi.method" @change="updateApi('method', $event)">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>
      <div class="api-field">
        <label>数据路径</label>
        <input type="text" :value="selectedApi.dataPath" @input="updateApi('dataPath', $event)" placeholder="data.list" />
      </div>
      <div class="api-field">
        <label>Label 字段</label>
        <input type="text" :value="selectedApi.labelField" @input="updateApi('labelField', $event)" placeholder="name" />
      </div>
      <div class="api-field">
        <label>Value 字段</label>
        <input type="text" :value="selectedApi.valueField" @input="updateApi('valueField', $event)" placeholder="id" />
      </div>
      <div class="api-field">
        <label>请求头 (JSON)</label>
        <textarea :value="selectedApi.headersStr" @input="updateHeaders($event)" rows="3" placeholder='{"Authorization": "Bearer xxx"}'></textarea>
      </div>
      <div class="api-field">
        <label>描述</label>
        <input type="text" :value="selectedApi.description" @input="updateApi('description', $event)" placeholder="API 描述" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ApiEndpoint } from '../types'

const props = defineProps<{
  apis: ApiEndpoint[]
}>()

const emit = defineEmits<{
  'update:apis': [apis: ApiEndpoint[]]
}>()

const selectedId = ref<string | null>(null)

const selectedApi = computed(() => {
  if (!selectedId.value) return null
  const api = props.apis.find(a => a.id === selectedId.value)
  if (!api) return null
  return { ...api, headersStr: api.headers ? JSON.stringify(api.headers, null, 2) : '' }
})

function generateId(): string {
  return 'api_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
}

function addApi() {
  const newApi: ApiEndpoint = { id: generateId(), name: '新 API', url: '', method: 'GET' }
  emit('update:apis', [...props.apis, newApi])
  selectedId.value = newApi.id
}

function deleteApi(id: string) {
  emit('update:apis', props.apis.filter(a => a.id !== id))
  if (selectedId.value === id) selectedId.value = null
}

function selectApi(id: string) { selectedId.value = id }

function updateApi(field: string, event: Event) {
  const value = (event.target as HTMLInputElement | HTMLSelectElement).value
  emit('update:apis', props.apis.map(a => a.id === selectedId.value ? { ...a, [field]: value } : a))
}

function updateHeaders(event: Event) {
  const value = (event.target as HTMLTextAreaElement).value
  let headers: Record<string, string> | undefined
  try { headers = value ? JSON.parse(value) : undefined } catch {}
  emit('update:apis', props.apis.map(a => a.id === selectedId.value ? { ...a, headers } : a))
}
</script>

<style scoped>
.api-panel { height: 100%; display: flex; flex-direction: column; background: #fff; }
.api-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
.api-title { font-size: 13px; font-weight: 500; color: #333; }
.api-add-btn { padding: 3px 10px; border: 1px solid #1890ff; background: #1890ff; color: #fff; border-radius: 4px; cursor: pointer; font-size: 12px; }
.api-list { flex: 1; overflow-y: auto; padding: 8px; }
.api-item { padding: 8px; border: 1px solid #f0f0f0; border-radius: 4px; margin-bottom: 6px; cursor: pointer; transition: all 0.15s; }
.api-item:hover { border-color: #91caff; }
.api-item--selected { border-color: #1890ff; background: #e6f7ff; }
.api-item-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.api-method { padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 600; color: #fff; }
.api-method--get { background: #52c41a; }
.api-method--post { background: #1890ff; }
.api-method--put { background: #faad14; }
.api-method--delete { background: #ff4d4f; }
.api-method--patch { background: #722ed1; }
.api-name { flex: 1; font-size: 12px; font-weight: 500; color: #333; }
.api-delete { padding: 2px 6px; border: none; background: none; color: #999; cursor: pointer; font-size: 12px; }
.api-delete:hover { color: #ff4d4f; }
.api-url { font-size: 11px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.api-empty { text-align: center; color: #999; font-size: 12px; padding: 20px; }
.api-detail { border-top: 1px solid #f0f0f0; padding: 12px; max-height: 50%; overflow-y: auto; }
.api-detail-title { font-size: 13px; font-weight: 500; color: #333; margin-bottom: 12px; }
.api-field { margin-bottom: 10px; }
.api-field label { display: block; font-size: 11px; color: #999; margin-bottom: 4px; }
.api-field input, .api-field select, .api-field textarea { width: 100%; padding: 5px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; box-sizing: border-box; }
.api-field input:focus, .api-field select:focus, .api-field textarea:focus { border-color: #1890ff; outline: none; }
.api-field textarea { font-family: monospace; resize: vertical; }
</style>