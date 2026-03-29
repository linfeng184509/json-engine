<script setup lang="ts">
import { ref, onMounted, onUnmounted, type Component } from 'vue';
import { createComponent, clearComponentCache } from '@json-engine/vue-json';
import type { VueJsonSchema } from '@json-engine/vue-json';

import {
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  InputPassword as AInputPassword,
  Button as AButton,
  Checkbox as ACheckbox,
  Spin as ASpin,
  Card as ACard,
  Alert as AAlert,
  Layout as ALayout,
  LayoutHeader as ALayoutHeader,
  LayoutContent as ALayoutContent,
  Result as AResult,
  ConfigProvider as AConfigProvider,
} from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import './styles/main.css';

import { setupApp, getPermissionProviderInstance, connectWebSocket, disconnectWebSocket, STORAGE_PREFIX } from './setup-app';

setupApp();

const antdComponents: Record<string, Component> = {
  'AForm': AForm,
  'AFormItem': AFormItem,
  'AInput': AInput,
  'AInputPassword': AInputPassword,
  'AButton': AButton,
  'ACheckbox': ACheckbox,
  'ASpin': ASpin,
  'ACard': ACard,
  'AAlert': AAlert,
  'ALayout': ALayout,
  'ALayoutHeader': ALayoutHeader,
  'ALayoutContent': ALayoutContent,
  'AResult': AResult,
};

const currentRoute = ref(window.location.hash.slice(1) || '/');
const isLoading = ref(true);
const pageComponent = ref<Component | null>(null);
const error = ref<string | null>(null);

const routes: Record<string, string> = {
  '/': '/schemas/pages/dashboard.json',
  '/login': '/schemas/pages/login.json',
  '/dashboard': '/schemas/pages/dashboard.json',
  '/404': '/schemas/pages/404.json',
};

async function loadPage(route: string) {
  isLoading.value = true;
  error.value = null;
  pageComponent.value = null;

  const normalizedRoute = route.split('?')[0] || '/';
  let schemaPath = routes[normalizedRoute];

  if (!schemaPath) {
    schemaPath = routes['/404'];
  }

  const token = localStorage.getItem(`${STORAGE_PREFIX}token`);
  if (normalizedRoute !== '/login' && !token) {
    window.location.hash = '/login';
    return;
  }

  if (normalizedRoute === '/login' && token) {
    window.location.hash = '/dashboard';
    return;
  }

  try {
    const response = await fetch(schemaPath);
    if (!response.ok) {
      throw new Error(`Failed to load schema: ${response.status}`);
    }
    const schema: VueJsonSchema = await response.json();

    const component = createComponent(schema, {
      cache: false,
      injectStyles: true,
      debug: false,
      extraComponents: antdComponents,
    });

    pageComponent.value = component;
  } catch (err) {
    console.error('Failed to load page:', err);
    error.value = err instanceof Error ? err.message : 'Unknown error';
  } finally {
    isLoading.value = false;
  }
}

function handleHashChange() {
  currentRoute.value = window.location.hash.slice(1) || '/';
  loadPage(currentRoute.value);
}

onMounted(() => {
  window.addEventListener('hashchange', handleHashChange);
  loadPage(currentRoute.value);

  const token = localStorage.getItem(`${STORAGE_PREFIX}token`);
  if (token) {
    connectWebSocket();
  }
});

onUnmounted(() => {
  window.removeEventListener('hashchange', handleHashChange);
  disconnectWebSocket();
});
</script>

<template>
  <AConfigProvider :theme="{ token: { colorPrimary: '#1677ff' } }">
    <div id="app">
      <div v-if="isLoading" class="loading-container">
        <ASpin size="large" />
      </div>

      <div v-else-if="error" class="error-container">
        <AResult status="error" title="加载失败" :sub-title="error">
          <template #extra>
            <AButton type="primary" @click="loadPage(currentRoute)">重试</AButton>
          </template>
        </AResult>
      </div>

      <component v-else-if="pageComponent" :is="pageComponent" />
    </div>
  </AConfigProvider>
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
</style>