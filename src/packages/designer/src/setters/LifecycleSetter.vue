<template>
  <div class="lifecycle-setter">
    <div v-for="hook in lifecycleHooks" :key="hook.name" class="lifecycle-item">
      <div class="lifecycle-header">
        <span class="lifecycle-name">{{ hook.name }}</span>
        <span class="lifecycle-desc">{{ hook.desc }}</span>
      </div>
      <textarea
        class="lifecycle-code"
        :value="getHook(hook.name)"
        @input="setHook(hook.name, $event)"
        :placeholder="'// ' + hook.desc"
        rows="2"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: Record<string, string> | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

const hooks = computed(() => props.modelValue || {})

const lifecycleHooks = [
  { name: 'onMounted', desc: '组件挂载后' },
  { name: 'onUnmounted', desc: '组件卸载后' },
  { name: 'onBeforeMount', desc: '组件挂载前' },
  { name: 'onBeforeUnmount', desc: '组件卸载前' },
  { name: 'onUpdated', desc: '组件更新后' },
  { name: 'onBeforeUpdate', desc: '组件更新前' },
  { name: 'onActivated', desc: 'keep-alive 激活' },
  { name: 'onDeactivated', desc: 'keep-alive 停用' },
]

function getHook(name: string): string {
  return hooks.value[name] || ''
}

function setHook(name: string, event: Event) {
  const value = (event.target as HTMLTextAreaElement).value
  const newHooks = { ...hooks.value }
  if (value) {
    newHooks[name] = value
  } else {
    delete newHooks[name]
  }
  emit('update:modelValue', newHooks)
}
</script>

<style scoped>
.lifecycle-setter { font-size: 12px; }
.lifecycle-item { margin-bottom: 8px; }
.lifecycle-header { display: flex; gap: 8px; align-items: center; margin-bottom: 4px; }
.lifecycle-name { font-size: 11px; font-weight: 500; color: #722ed1; font-family: monospace; }
.lifecycle-desc { font-size: 10px; color: #999; }
.lifecycle-code { width: 100%; padding: 6px; border: 1px solid #d9d9d9; border-radius: 4px; font-family: monospace; font-size: 11px; resize: vertical; box-sizing: border-box; background: #fafafa; }
.lifecycle-code:focus { border-color: #722ed1; outline: none; background: #fff; }
</style>