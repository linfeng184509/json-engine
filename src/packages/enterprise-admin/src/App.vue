<script setup lang="ts">
import { ref, shallowRef, onMounted, type Component } from 'vue';
import {
  loadComponent,
  createCoreScope,
  setCoreScope,
  registerGlobalComponents,
} from '@json-engine/vue-json';
import {
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputPassword as AInputPassword,
  Checkbox as ACheckbox,
  Button as AButton,
  Spin as ASpin,
  Card as ACard,
  Layout as ALayout,
  LayoutHeader as ALayoutHeader,
  LayoutContent as ALayoutContent,
  Result as AResult,
} from 'ant-design-vue';

import { setupApp, connectWebSocket } from './setup-app';

import 'ant-design-vue/dist/reset.css';
import './styles/main.css';

const antdComponents: Record<string, Component> = {
  AForm,
  AFormItem,
  AInput,
  AInputPassword,
  ACheckbox,
  AButton,
  ASpin,
  ACard,
  ALayout,
  ALayoutHeader,
  ALayoutContent,
  AResult,
};

// 注册全局组件，供 PageLoader 使用
registerGlobalComponents(antdComponents);

const appRootComponent = shallowRef<Component | null>(null);
const error = ref<string | null>(null);

async function bootstrap(): Promise<void> {
  try {
    const coreScope = createCoreScope();
    setCoreScope(coreScope);

    const appConfigResponse = await fetch('/schemas/app.json');
    if (!appConfigResponse.ok) {
      throw new Error(`Failed to load app config: ${appConfigResponse.status}`);
    }
    const appConfig = await appConfigResponse.json();
    
    window.__APP_ROUTES__ = appConfig.router?.routes || [];
    
    setupApp(appConfig);

    const result = await loadComponent('/schemas/app-root.json', {
      cache: false,
      injectStyles: true,
      extraComponents: antdComponents,
    });

    if (result.success && result.component) {
      appRootComponent.value = result.component;

      const token = coreScope._storage.get('token');
      if (token) {
        connectWebSocket();
      }
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
  background: #f0f2f5;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
}

.error-result {
  text-align: center;
  padding: 24px;
}

.error-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
  background: #fff2f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
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