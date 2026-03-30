<template>
  <div class="i18n-setter">
    <div class="i18n-header">
      <span class="i18n-title">{{ t.property.tabs.i18n || '内容翻译' }}</span>
    </div>
    <div class="i18n-fields">
      <div v-for="field in translatableFields" :key="field.key" class="i18n-field">
        <div class="i18n-field-label">{{ field.label }}</div>
        <div class="i18n-translations">
          <div v-for="lang in supportedLocales" :key="lang.code" class="i18n-row">
            <span class="i18n-lang">{{ lang.flag }}</span>
            <input
              type="text"
              class="i18n-input"
              :value="getTranslation(field.key, lang.code)"
              :placeholder="getOriginalValue(field.key)"
              @input="setTranslation(field.key, lang.code, $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '../i18n'

const { t } = useLocale()

const props = defineProps<{
  nodeType: string
  props: Record<string, unknown> | undefined
  i18n: Record<string, Record<string, string>> | undefined
}>()

const emit = defineEmits<{
  'update:i18n': [value: Record<string, Record<string, string>>]
}>()

const supportedLocales = [
  { code: 'zh-CN', flag: '🇨🇳', name: '中文' },
  { code: 'en-US', flag: '🇺🇸', name: 'English' },
]

const translatableFieldMap: Record<string, { key: string; label: string }[]> = {
  AFormItem: [
    { key: 'label', label: 'Label / 标签' },
    { key: 'extra', label: 'Extra / 提示' },
  ],
  AInput: [
    { key: 'placeholder', label: 'Placeholder / 占位符' },
  ],
  AInputPassword: [
    { key: 'placeholder', label: 'Placeholder / 占位符' },
  ],
  ATextArea: [
    { key: 'placeholder', label: 'Placeholder / 占位符' },
  ],
  AInputNumber: [
    { key: 'placeholder', label: 'Placeholder / 占位符' },
  ],
  ASelect: [
    { key: 'placeholder', label: 'Placeholder / 占位符' },
  ],
  ADatePicker: [
    { key: 'placeholder', label: 'Placeholder / 占位符' },
  ],
  ATimePicker: [
    { key: 'placeholder', label: 'Placeholder / 占位符' },
  ],
  ACascader: [
    { key: 'placeholder', label: 'Placeholder / 占位符' },
  ],
  ASwitch: [
    { key: 'checkedChildren', label: 'Checked / 选中文字' },
    { key: 'unCheckedChildren', label: 'Unchecked / 未选文字' },
  ],
}

const translatableFields = computed(() => {
  // Get fields for current type
  const fields = translatableFieldMap[props.nodeType] || []
  // Also check parent AFormItem if type is a form field
  const parentFields = translatableFieldMap['AFormItem'] || []
  return [...parentFields, ...fields.filter(f => !parentFields.find(pf => pf.key === f.key))]
})

function getOriginalValue(key: string): string {
  return String(props.props?.[key] || '')
}

function getTranslation(key: string, locale: string): string {
  return props.i18n?.[locale]?.[key] || ''
}

function setTranslation(key: string, locale: string, event: Event) {
  const value = (event.target as HTMLInputElement).value
  const newI18n = { ...(props.i18n || {}) }
  if (!newI18n[locale]) newI18n[locale] = {}
  if (value) {
    newI18n[locale][key] = value
  } else {
    delete newI18n[locale][key]
    if (Object.keys(newI18n[locale]).length === 0) delete newI18n[locale]
  }
  emit('update:i18n', Object.keys(newI18n).length ? newI18n : {} as any)
}
</script>

<style scoped>
.i18n-setter { font-size: 12px; }
.i18n-header { margin-bottom: 12px; }
.i18n-title { font-size: 13px; font-weight: 500; color: #333; }
.i18n-field { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
.i18n-field:last-child { border-bottom: none; }
.i18n-field-label { font-size: 11px; color: #999; margin-bottom: 6px; font-weight: 500; }
.i18n-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.i18n-lang { font-size: 14px; width: 20px; text-align: center; }
.i18n-input { flex: 1; padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; }
.i18n-input:focus { border-color: #1890ff; outline: none; }
.i18n-input::placeholder { color: #ccc; }
</style>