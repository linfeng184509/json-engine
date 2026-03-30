<template>
  <div class="json-preview">
    <div class="json-preview-toolbar">
      <button class="json-btn" @click="copyJson">复制 JSON</button>
      <button class="json-btn" @click="downloadJson">下载</button>
      <button class="json-btn json-btn--primary" @click="emit('apply', jsonText)">应用</button>
    </div>
    <textarea
      class="json-preview-editor"
      v-model="jsonText"
      spellcheck="false"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { DesignNode, ApiEndpoint } from '../types'
import { generateVueJsonSchema } from '../utils/schemaGenerator'

const props = defineProps<{
  tree: DesignNode
  formName?: string
  apis?: ApiEndpoint[]
}>()

const emit = defineEmits<{
  apply: [json: string]
}>()

const jsonOutput = computed(() => {
  const schema = generateVueJsonSchema(props.tree, props.formName, props.apis)
  return JSON.stringify(schema, null, 2)
})

const jsonText = ref('')

watch(jsonOutput, (val) => {
  jsonText.value = val
}, { immediate: true })

function copyJson() {
  navigator.clipboard.writeText(jsonText.value)
}

function downloadJson() {
  const blob = new Blob([jsonText.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = (props.formName || 'form') + '.json'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.json-preview { position: absolute; inset: 0; display: flex; flex-direction: column; background: #1e1e1e; }
.json-preview-toolbar { display: flex; gap: 8px; padding: 8px; background: #2d2d2d; }
.json-btn { padding: 4px 12px; border: 1px solid #555; border-radius: 4px; background: #3c3c3c; color: #ccc; cursor: pointer; font-size: 12px; }
.json-btn:hover { background: #505050; }
.json-btn--primary { background: #1890ff; border-color: #1890ff; color: #fff; }
.json-btn--primary:hover { background: #40a9ff; }
.json-preview-editor { flex: 1; padding: 12px; background: #1e1e1e; color: #d4d4d4; border: none; resize: none; font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; line-height: 1.5; tab-size: 2; }
.json-preview-editor:focus { outline: none; }
</style>
