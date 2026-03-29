<script setup lang="ts">
import { ref, watch, shallowRef, computed } from 'vue';
import { createComponent, clearComponentCache } from '@json-engine/vue-json';

import counterSchema from '../examples/counter.json';
import formSchema from '../examples/form.json';
import todoListSchema from '../examples/todo-list.json';

const props = defineProps<{
  exampleId: string;
}>();

const schemas: Record<string, any> = {
  'counter': counterSchema,
  'form': formSchema,
  'todo-list': todoListSchema,
};

const component = shallowRef<any>(null);
const error = ref<string | null>(null);
const loading = ref(true);

function loadExample(exampleId: string) {
  loading.value = true;
  error.value = null;
  component.value = null;
  
  try {
    const schema = schemas[exampleId];
    if (!schema) {
      throw new Error(`Unknown example: ${exampleId}`);
    }
    
    clearComponentCache();
    component.value = createComponent(schema, { cache: false });
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
    console.error('Failed to load example:', e);
  } finally {
    loading.value = false;
  }
}

watch(() => props.exampleId, (newId) => {
  loadExample(newId);
}, { immediate: true });
</script>

<template>
  <div class="example-viewer">
    <div v-if="loading" class="loading">
      Loading...
    </div>
    
    <div v-else-if="error" class="error">
      <h3>Error</h3>
      <pre>{{ error }}</pre>
    </div>
    
    <div v-else-if="component" class="component-container">
      <component :is="component" />
    </div>
    
    <div v-else class="empty">
      Select an example to preview
    </div>
  </div>
</template>

<style scoped>
.example-viewer {
  min-height: 200px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #6c757d;
}

.error {
  padding: 20px;
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  color: #c53030;
}

.error h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.error pre {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.component-container {
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fafafa;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #adb5bd;
}
</style>