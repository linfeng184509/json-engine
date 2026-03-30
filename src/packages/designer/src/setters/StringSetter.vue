<template>
  <div class="setter">
    <label class="setter-label">{{ label }}</label>
    <input
      class="setter-input"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="help" class="setter-help">{{ help }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  modelValue: string | undefined
  placeholder?: string
  help?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.setter { margin-bottom: 12px; }
.setter-label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
.setter-input { width: 100%; padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; box-sizing: border-box; }
.setter-input:focus { border-color: #1890ff; outline: none; box-shadow: 0 0 0 2px rgba(24,144,255,0.2); }
.setter-help { font-size: 11px; color: #999; margin: 2px 0 0; }
</style>