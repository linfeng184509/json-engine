<template>
  <div class="style-setter">
    <div class="style-section">
      <div class="style-section-title">尺寸</div>
      <div class="style-row">
        <div class="style-item">
          <label>宽</label>
          <input type="text" :value="getStyle('width')" @input="setStyle('width', $event)" placeholder="auto" />
        </div>
        <div class="style-item">
          <label>高</label>
          <input type="text" :value="getStyle('height')" @input="setStyle('height', $event)" placeholder="auto" />
        </div>
      </div>
    </div>
    <div class="style-section">
      <div class="style-section-title">外边距</div>
      <div class="style-row">
        <div class="style-item"><label>上</label><input type="text" :value="getStyle('marginTop')" @input="setStyle('marginTop', $event)" placeholder="0" /></div>
        <div class="style-item"><label>右</label><input type="text" :value="getStyle('marginRight')" @input="setStyle('marginRight', $event)" placeholder="0" /></div>
        <div class="style-item"><label>下</label><input type="text" :value="getStyle('marginBottom')" @input="setStyle('marginBottom', $event)" placeholder="0" /></div>
        <div class="style-item"><label>左</label><input type="text" :value="getStyle('marginLeft')" @input="setStyle('marginLeft', $event)" placeholder="0" /></div>
      </div>
    </div>
    <div class="style-section">
      <div class="style-section-title">内边距</div>
      <div class="style-row">
        <div class="style-item"><label>上</label><input type="text" :value="getStyle('paddingTop')" @input="setStyle('paddingTop', $event)" placeholder="0" /></div>
        <div class="style-item"><label>右</label><input type="text" :value="getStyle('paddingRight')" @input="setStyle('paddingRight', $event)" placeholder="0" /></div>
        <div class="style-item"><label>下</label><input type="text" :value="getStyle('paddingBottom')" @input="setStyle('paddingBottom', $event)" placeholder="0" /></div>
        <div class="style-item"><label>左</label><input type="text" :value="getStyle('paddingLeft')" @input="setStyle('paddingLeft', $event)" placeholder="0" /></div>
      </div>
    </div>
    <div class="style-section">
      <div class="style-section-title">背景</div>
      <div class="style-row">
        <div class="style-item" style="flex:1">
          <label>颜色</label>
          <div class="style-color">
            <input type="color" :value="getStyle('backgroundColor') || '#ffffff'" @input="setStyle('backgroundColor', $event)" />
            <input type="text" :value="getStyle('backgroundColor')" @input="setStyle('backgroundColor', $event)" placeholder="transparent" />
          </div>
        </div>
      </div>
    </div>
    <div class="style-section">
      <div class="style-section-title">文字</div>
      <div class="style-row">
        <div class="style-item"><label>大小</label><input type="text" :value="getStyle('fontSize')" @input="setStyle('fontSize', $event)" placeholder="14px" /></div>
        <div class="style-item"><label>粗细</label>
          <select :value="getStyle('fontWeight')" @change="setStyle('fontWeight', $event)">
            <option value="">默认</option>
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="500">500</option>
            <option value="600">600</option>
          </select>
        </div>
      </div>
      <div class="style-row">
        <div class="style-item" style="flex:1">
          <label>颜色</label>
          <div class="style-color">
            <input type="color" :value="getStyle('color') || '#000000'" @input="setStyle('color', $event)" />
            <input type="text" :value="getStyle('color')" @input="setStyle('color', $event)" placeholder="#000000" />
          </div>
        </div>
      </div>
    </div>
    <div class="style-section">
      <div class="style-section-title">边框</div>
      <div class="style-row">
        <div class="style-item"><label>宽度</label><input type="text" :value="getStyle('borderWidth')" @input="setStyle('borderWidth', $event)" placeholder="1px" /></div>
        <div class="style-item"><label>样式</label>
          <select :value="getStyle('borderStyle')" @change="setStyle('borderStyle', $event)">
            <option value="">默认</option>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>
        <div class="style-item"><label>圆角</label><input type="text" :value="getStyle('borderRadius')" @input="setStyle('borderRadius', $event)" placeholder="4px" /></div>
      </div>
      <div class="style-row">
        <div class="style-item" style="flex:1">
          <label>颜色</label>
          <div class="style-color">
            <input type="color" :value="getStyle('borderColor') || '#d9d9d9'" @input="setStyle('borderColor', $event)" />
            <input type="text" :value="getStyle('borderColor')" @input="setStyle('borderColor', $event)" placeholder="#d9d9d9" />
          </div>
        </div>
      </div>
    </div>
    <div class="style-section">
      <div class="style-section-title">自定义 CSS</div>
      <textarea class="style-custom" :value="customCss" @input="onCustomCss" placeholder="width: 100%;&#10;color: red;"></textarea>
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

const styles = computed(() => props.modelValue || {})

function getStyle(key: string): string {
  return styles.value[key] || ''
}

function setStyle(key: string, event: Event) {
  const value = (event.target as HTMLInputElement | HTMLSelectElement).value
  const newStyles = { ...styles.value }
  if (value) {
    newStyles[key] = value
  } else {
    delete newStyles[key]
  }
  emit('update:modelValue', newStyles)
}

const customCss = computed(() => {
  return Object.entries(styles.value).map(([k, v]) => `${k}: ${v}`).join(';\n')
})

function onCustomCss(event: Event) {
  const value = (event.target as HTMLTextAreaElement).value
  const newStyles: Record<string, string> = {}
  value.split(';').forEach(line => {
    const [k, ...v] = line.split(':')
    if (k && v.length) {
      newStyles[k.trim()] = v.join(':').trim()
    }
  })
  emit('update:modelValue', newStyles)
}
</script>

<style scoped>
.style-setter { font-size: 12px; }
.style-section { margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; }
.style-section:last-child { border-bottom: none; }
.style-section-title { font-size: 11px; color: #999; margin-bottom: 6px; font-weight: 500; }
.style-row { display: flex; gap: 4px; margin-bottom: 4px; }
.style-item { flex: 1; min-width: 0; }
.style-item label { display: block; font-size: 10px; color: #999; margin-bottom: 2px; }
.style-item input, .style-item select { width: 100%; padding: 3px 4px; border: 1px solid #d9d9d9; border-radius: 3px; font-size: 11px; box-sizing: border-box; }
.style-item input:focus, .style-item select:focus { border-color: #1890ff; outline: none; }
.style-color { display: flex; gap: 4px; align-items: center; }
.style-color input[type="color"] { width: 24px; height: 24px; padding: 0; border: 1px solid #d9d9d9; border-radius: 3px; cursor: pointer; }
.style-color input[type="text"] { flex: 1; }
.style-custom { width: 100%; height: 80px; padding: 6px; border: 1px solid #d9d9d9; border-radius: 4px; font-family: monospace; font-size: 11px; resize: vertical; box-sizing: border-box; }
.style-custom:focus { border-color: #1890ff; outline: none; }
</style>