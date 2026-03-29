<script setup lang="ts">
import { ref } from 'vue';
import ExampleViewer from './components/ExampleViewer.vue';

const examples = [
  { id: 'counter', name: 'Counter', file: 'counter.json' },
  { id: 'form', name: 'Form', file: 'form.json' },
  { id: 'todo-list', name: 'Todo List', file: 'todo-list.json' },
];

const selectedExample = ref('counter');
</script>

<template>
  <div class="playground">
    <header class="header">
      <h1>Vue JSON Playground</h1>
      <span class="subtitle">Core-Engine Format Examples</span>
    </header>
    
    <main class="main">
      <aside class="sidebar">
        <h2>Examples</h2>
        <ul class="example-list">
          <li
            v-for="example in examples"
            :key="example.id"
            :class="['example-item', { active: selectedExample === example.id }]"
            @click="selectedExample = example.id"
          >
            {{ example.name }}
          </li>
        </ul>
      </aside>
      
      <section class="preview">
        <ExampleViewer :example-id="selectedExample" />
      </section>
    </main>
  </div>
</template>

<style scoped>
.playground {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  padding: 16px;
  overflow-y: auto;
}

.sidebar h2 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.example-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.example-item {
  padding: 10px 12px;
  margin: 4px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.example-item:hover {
  background: #e9ecef;
}

.example-item.active {
  background: #667eea;
  color: white;
}

.preview {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: white;
}
</style>