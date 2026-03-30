<template>
  <div class="setter">
    <label class="setter-label">{{ label }}</label>
    <select
      class="setter-select"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled>请选择</option>
      <option v-for="opt in options" :key="String(opt.value)" :value="String(opt.value)">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  modelValue: unknown
  options: { label: string; value: unknown }[]
}>()

defineEmits<{
  'update:modelValue': [value: unknown]
}>()
</script>

<style scoped>
.setter { margin-bottom: 12px; }
.setter-label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
.setter-select { width: 100%; padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; background: #fff; box-sizing: border-box; }
.setter-select:focus { border-color: #1890ff; outline: none; }
</style>