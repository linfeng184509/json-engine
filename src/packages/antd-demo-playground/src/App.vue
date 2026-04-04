<script setup lang="ts">
import { ref, shallowRef, onMounted, type Component } from 'vue';
import {
  loadComponent,
} from '@json-engine/vue-json';

import { setupApp } from './setup-app';

import 'ant-design-vue/dist/reset.css';
import './styles/main.css';

const appRootComponent = shallowRef<Component | null>(null);
const error = ref<string | null>(null);

async function bootstrap(): Promise<void> {
  try {
    const { default: appConfig } = await import('./schemas/app.json');
    
    window.__APP_ROUTES__ = appConfig.router?.routes || [];
    
    await setupApp(appConfig);

    const result = await loadComponent('./schemas/app-root.json', {
      cache: false,
      injectStyles: true,
    });

    if (result.success && result.component) {
      appRootComponent.value = result.component;
    } else {
      error.value = result.error?.message || 'Failed to load app';
    }
  } catch (err) {
    console.error('Bootstrap failed:', err);
    error.value = err instanceof Error ? err.message : 'Bootstrap failed';
  }
}

onMounted(() => {
  bootstrap();
});
</script>

<template>
  <div id="app">
    <div v-if="error" class="error-container">
      <div class="error-result">
        <div class="error-icon">!</div>
        <h2>Bootstrap Failed</h2>
        <p>{{ error }}</p>
      </div>
    </div>
    <component v-else-if="appRootComponent" :is="appRootComponent" />
    <div v-else class="loading-container">
      <span>Loading...</span>
    </div>
  </div>
</template>

<style>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f5f5;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.error-result {
  text-align: center;
  padding: 24px;
}

.error-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
  background: #fff1f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
  color: #ff4d4f;
}

.error-result h2 {
  color: rgba(0, 0, 0, 0.85);
  font-size: 24px;
  margin-bottom: 8px;
}

.error-result p {
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 24px;
}
</style>