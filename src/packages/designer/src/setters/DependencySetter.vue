<template>
  <div class="dependency-setter">
    <div class="dep-section">
      <div class="dep-section-title">显示条件</div>
      <div class="dep-row">
        <select v-model="localDeps.visibleType" @change="emitDeps">
          <option value="">始终显示</option>
          <option value="equals">当...等于</option>
          <option value="notEquals">当...不等于</option>
          <option value="contains">当...包含</option>
          <option value="empty">当...为空</option>
          <option value="notEmpty">当...不为空</option>
        </select>
      </div>
      <div v-if="localDeps.visibleType" class="dep-row">
        <select v-model="localDeps.visibleField" @change="emitDeps">
          <option value="">选择字段</option>
          <option v-for="f in otherFields" :key="f.id" :value="f.binding">{{ f.label }} ({{ f.type }})</option>
        </select>
      </div>
      <div v-if="localDeps.visibleType && !['empty','notEmpty'].includes(localDeps.visibleType)" class="dep-row">
        <input v-model="localDeps.visibleValue" @input="emitDeps" placeholder="输入值" />
      </div>
    </div>

    <div class="dep-section">
      <div class="dep-section-title">禁用条件</div>
      <div class="dep-row">
        <select v-model="localDeps.disabledType" @change="emitDeps">
          <option value="">始终可用</option>
          <option value="equals">当...等于</option>
          <option value="notEquals">当...不等于</option>
          <option value="empty">当...为空</option>
          <option value="notEmpty">当...不为空</option>
        </select>
      </div>
      <div v-if="localDeps.disabledType" class="dep-row">
        <select v-model="localDeps.disabledField" @change="emitDeps">
          <option value="">选择字段</option>
          <option v-for="f in otherFields" :key="f.id" :value="f.binding">{{ f.label }} ({{ f.type }})</option>
        </select>
      </div>
      <div v-if="localDeps.disabledType && !['empty','notEmpty'].includes(localDeps.disabledType)" class="dep-row">
        <input v-model="localDeps.disabledValue" @input="emitDeps" placeholder="输入值" />
      </div>
    </div>

    <div class="dep-section">
      <div class="dep-section-title">值联动</div>
      <div class="dep-row">
        <select v-model="localDeps.valueLinkField" @change="emitDeps">
          <option value="">无联动</option>
          <option v-for="f in otherFields" :key="f.id" :value="f.binding">当 {{ f.label }} 变化时</option>
        </select>
      </div>
      <div v-if="localDeps.valueLinkField" class="dep-row">
        <textarea v-model="localDeps.valueLinkScript" @input="emitDeps" placeholder="// 处理函数&#10;// 参数: value (变化的值)&#10;// 返回: 新的值&#10;return value" rows="4"></textarea>
      </div>
    </div>

    <div class="dep-section">
      <div class="dep-section-title">数据源联动</div>
      <div class="dep-row">
        <select v-model="localDeps.dataSourceField" @change="emitDeps">
          <option value="">无数据源</option>
          <option v-for="f in otherFields" :key="f.id" :value="f.binding">{{ f.label }} 的值</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

interface FieldInfo {
  id: string
  label: string
  type: string
  binding: string
}

interface DependencyConfig {
  visibleType?: string
  visibleField?: string
  visibleValue?: string
  disabledType?: string
  disabledField?: string
  disabledValue?: string
  valueLinkField?: string
  valueLinkScript?: string
  dataSourceField?: string
}

const props = defineProps<{
  modelValue: DependencyConfig | undefined
  otherFields: FieldInfo[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DependencyConfig]
}>()

const localDeps = reactive<DependencyConfig>({
  visibleType: '',
  visibleField: '',
  visibleValue: '',
  disabledType: '',
  disabledField: '',
  disabledValue: '',
  valueLinkField: '',
  valueLinkScript: '',
  dataSourceField: ''
})

watch(() => props.modelValue, (val) => {
  if (val) {
    Object.assign(localDeps, val)
  }
}, { immediate: true })

function emitDeps() {
  const cleaned: DependencyConfig = {}
  if (localDeps.visibleType) {
    cleaned.visibleType = localDeps.visibleType
    cleaned.visibleField = localDeps.visibleField
    cleaned.visibleValue = localDeps.visibleValue
  }
  if (localDeps.disabledType) {
    cleaned.disabledType = localDeps.disabledType
    cleaned.disabledField = localDeps.disabledField
    cleaned.disabledValue = localDeps.disabledValue
  }
  if (localDeps.valueLinkField) {
    cleaned.valueLinkField = localDeps.valueLinkField
    cleaned.valueLinkScript = localDeps.valueLinkScript
  }
  if (localDeps.dataSourceField) {
    cleaned.dataSourceField = localDeps.dataSourceField
  }
  emit('update:modelValue', cleaned)
}
</script>

<style scoped>
.dependency-setter { font-size: 12px; }
.dep-section { margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; }
.dep-section:last-child { border-bottom: none; }
.dep-section-title { font-size: 11px; color: #999; margin-bottom: 6px; font-weight: 500; }
.dep-row { margin-bottom: 6px; }
.dep-row select, .dep-row input { width: 100%; padding: 5px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; box-sizing: border-box; }
.dep-row select:focus, .dep-row input:focus { border-color: #1890ff; outline: none; }
.dep-row textarea { width: 100%; padding: 6px; border: 1px solid #d9d9d9; border-radius: 4px; font-family: monospace; font-size: 11px; resize: vertical; box-sizing: border-box; }
.dep-row textarea:focus { border-color: #1890ff; outline: none; }
</style>