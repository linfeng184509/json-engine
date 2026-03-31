<template>
  <div class="setter json-setter">
    <label class="setter-label">{{ label }}</label>
    <textarea
      class="setter-textarea"
      :value="jsonText"
      :placeholder="placeholder"
      @input="handleInput"
      @blur="formatJson"
    />
    <div v-if="error" class="setter-error">{{ error }}</div>
    <p v-if="help" class="setter-help">{{ help }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  label: string
  modelValue?: unknown
  placeholder?: string
  help?: string
  type?: string
  required?: boolean
  validator?: { type: 'function'; params: string; body: string }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const error = ref<string | null>(null)

const jsonText = computed(() => {
  if (props.modelValue === undefined || props.modelValue === null) {
    return ''
  }
  try {
    return JSON.stringify(props.modelValue, null, 2)
  } catch {
    return String(props.modelValue)
  }
})

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  const value = target.value

  if (!value.trim()) {
    emit('update:modelValue', undefined)
    error.value = null
    return
  }

  try {
    const parsed = JSON.parse(value)
    emit('update:modelValue', parsed)
    error.value = null
  } catch (e) {
    error.value = 'Invalid JSON'
  }
}

function formatJson() {
  if (props.modelValue !== undefined && props.modelValue !== null) {
    try {
      const formatted = JSON.stringify(props.modelValue, null, 2)
      if (formatted !== jsonText.value) {
        emit('update:modelValue', JSON.parse(formatted))
      }
      error.value = null
    } catch {
      error.value = 'Cannot format invalid JSON'
    }
  }
}
</script>

<style scoped>
.setter { margin-bottom: 12px; }
.setter-label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
.setter-textarea { 
  width: 100%; 
  min-height: 60px; 
  padding: 4px 8px; 
  border: 1px solid #d9d9d9; 
  border-radius: 4px; 
  font-size: 13px; 
  font-family: monospace; 
  box-sizing: border-box; 
  resize: vertical;
}
.setter-textarea:focus { 
  border-color: #1890ff; 
  outline: none; 
  box-shadow: 0 0 0 2px rgba(24,144,255,0.2); 
}
.setter-error { font-size: 11px; color: #ff4d4f; margin: 2px 0 0; }
.setter-help { font-size: 11px; color: #999; margin: 2px 0 0; }
</style>
