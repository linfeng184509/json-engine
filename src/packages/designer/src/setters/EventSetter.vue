<template>
  <div class="event-setter">
    <div v-for="event in commonEvents" :key="event.name" class="event-item">
      <div class="event-header">
        <span class="event-name">{{ event.name }}</span>
        <span class="event-desc">{{ event.desc }}</span>
      </div>
      <textarea
        class="event-code"
        :value="getEvent(event.name)"
        @input="setEvent(event.name, $event)"
        :placeholder="'// ' + event.desc"
        rows="2"
      ></textarea>
    </div>
    <div class="event-custom">
      <div class="event-section-title">自定义事件</div>
      <div class="event-add">
        <input type="text" v-model="newEventName" placeholder="事件名 (如: onCustom)" />
        <button @click="addCustomEvent">+</button>
      </div>
      <div v-for="(code, name) in customEvents" :key="name" class="event-item">
        <div class="event-header">
          <span class="event-name">{{ name }}</span>
          <button class="event-remove" @click="removeEvent(name as string)">✕</button>
        </div>
        <textarea class="event-code" :value="code" @input="setEvent(name as string, $event)" rows="2"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue: Record<string, string> | undefined
  componentType?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

const newEventName = ref('')
const events = computed(() => props.modelValue || {})

const commonEvents = [
  { name: 'onClick', desc: '点击事件' },
  { name: 'onChange', desc: '值变化事件' },
  { name: 'onInput', desc: '输入事件' },
  { name: 'onFocus', desc: '获得焦点' },
  { name: 'onBlur', desc: '失去焦点' },
  { name: 'onPressEnter', desc: '回车事件' },
]

const customEvents = computed(() => {
  const common = commonEvents.map(e => e.name)
  const result: Record<string, string> = {}
  for (const [k, v] of Object.entries(events.value)) {
    if (!common.includes(k) && v) {
      result[k] = v
    }
  }
  return result
})

function getEvent(name: string): string {
  return events.value[name] || ''
}

function setEvent(name: string, event: Event) {
  const value = (event.target as HTMLTextAreaElement).value
  const newEvents = { ...events.value }
  if (value) {
    newEvents[name] = value
  } else {
    delete newEvents[name]
  }
  emit('update:modelValue', newEvents)
}

function addCustomEvent() {
  if (newEventName.value) {
    const newEvents = { ...events.value, [newEventName.value]: '' }
    emit('update:modelValue', newEvents)
    newEventName.value = ''
  }
}

function removeEvent(name: string) {
  const newEvents = { ...events.value }
  delete newEvents[name]
  emit('update:modelValue', newEvents)
}
</script>

<style scoped>
.event-setter { font-size: 12px; }
.event-item { margin-bottom: 8px; }
.event-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.event-name { font-size: 11px; font-weight: 500; color: #1890ff; font-family: monospace; }
.event-desc { font-size: 10px; color: #999; }
.event-code { width: 100%; padding: 6px; border: 1px solid #d9d9d9; border-radius: 4px; font-family: monospace; font-size: 11px; resize: vertical; box-sizing: border-box; background: #fafafa; }
.event-code:focus { border-color: #1890ff; outline: none; background: #fff; }
.event-section-title { font-size: 11px; color: #999; margin: 12px 0 6px; font-weight: 500; padding-top: 8px; border-top: 1px solid #f0f0f0; }
.event-add { display: flex; gap: 4px; margin-bottom: 8px; }
.event-add input { flex: 1; padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 11px; }
.event-add button { padding: 4px 10px; border: 1px solid #1890ff; background: #1890ff; color: #fff; border-radius: 4px; cursor: pointer; font-size: 12px; }
.event-remove { padding: 2px 6px; border: none; background: none; color: #ff4d4f; cursor: pointer; font-size: 12px; }
</style>