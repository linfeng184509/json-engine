<template>
  <div class="setter setter-row">
    <label class="setter-label">{{ label }}</label>
    <input
      class="setter-switch"
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  modelValue: boolean | undefined
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped>
.setter-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.setter-label { font-size: 12px; color: #666; }
.setter-switch { width: 36px; height: 20px; cursor: pointer; }
</style>