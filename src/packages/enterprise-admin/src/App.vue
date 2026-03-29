<script setup lang="ts">
import { ref, onMounted, onUnmounted, type Component } from 'vue';
import { createComponent } from '@json-engine/vue-json';
import type { VueJsonSchema, RouteConfig } from '@json-engine/vue-json';

import { loadAppConfig, matchRoute, getRouteSchemaPath, type AppConfig } from './use-app-config';
import { setupApp, getStoragePrefix, connectWebSocket, disconnectWebSocket } from './setup-app';

import 'ant-design-vue/dist/reset.css';
import './styles/main.css';

const isLoading = ref(true);
const isInitializing = ref(true);
const error = ref<string | null>(null);
const appConfig = ref<AppConfig | null>(null);
const pageComponent = ref<Component | null>(null);

const currentRoute = ref(window.location.hash.slice(1) || '/');

async function initializeApp(): Promise<void> {
  try {
    isInitializing.value = true;
    const config = await loadAppConfig('/schemas/app.json');
    appConfig.value = config;
    setupApp(config.schema);
    isInitializing.value = false;
  } catch (err) {
    console.error('Failed to initialize app:', err);
    error.value = err instanceof Error ? err.message : '初始化失败';
    isInitializing.value = false;
  }
}

async function loadPage(route: string): Promise<void> {
  if (!appConfig.value) {
    return;
  }

  isLoading.value = true;
  error.value = null;
  pageComponent.value = null;

  const normalizedRoute = route.split('?')[0] || '/';
  const matchedRoute = matchRoute(appConfig.value.routes, normalizedRoute);

  if (!matchedRoute) {
    const notFoundRoute = appConfig.value.routes.find(r => r.name === 'NotFound');
    if (notFoundRoute) {
      loadPageSchema(notFoundRoute);
    } else {
      error.value = '页面未找到';
      isLoading.value = false;
    }
    return;
  }

  if (matchedRoute.redirect) {
    window.location.hash = matchedRoute.redirect;
    return;
  }

  const storagePrefix = getStoragePrefix();
  const token = localStorage.getItem(`${storagePrefix}token`);

  if (matchedRoute.meta?.requiresAuth && !token) {
    window.location.hash = '/login';
    return;
  }

  if (normalizedRoute === '/login' && token) {
    window.location.hash = '/dashboard';
    return;
  }

  loadPageSchema(matchedRoute);
}

async function loadPageSchema(route: RouteConfig): Promise<void> {
  if (!appConfig.value) {
    return;
  }

  const schemaPath = getRouteSchemaPath(route);
  if (!schemaPath) {
    error.value = '页面 Schema 路径未配置';
    isLoading.value = false;
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
      extraComponents: appConfig.value.components,
    });

    pageComponent.value = component;
  } catch (err) {
    console.error('Failed to load page:', err);
    error.value = err instanceof Error ? err.message : 'Unknown error';
  } finally {
    isLoading.value = false;
  }
}

function handleHashChange(): void {
  currentRoute.value = window.location.hash.slice(1) || '/';
  loadPage(currentRoute.value);
}

onMounted(async () => {
  await initializeApp();

  window.addEventListener('hashchange', handleHashChange);

  if (appConfig.value) {
    loadPage(currentRoute.value);

    const storagePrefix = getStoragePrefix();
    const token = localStorage.getItem(`${storagePrefix}token`);
    if (token) {
      connectWebSocket();
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('hashchange', handleHashChange);
  disconnectWebSocket();
});
</script>

<template>
  <div id="app">
    <div v-if="isInitializing" class="loading-container">
      <span>正在加载应用配置...</span>
    </div>

    <div v-else-if="isLoading" class="loading-container">
      <span class="ant-spin ant-spin-spinning">
        <span class="ant-spin-dot ant-spin-dot-spin">
          <i class="ant-spin-dot-item"></i>
          <i class="ant-spin-dot-item"></i>
          <i class="ant-spin-dot-item"></i>
          <i class="ant-spin-dot-item"></i>
        </span>
      </span>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-result">
        <div class="error-icon">!</div>
        <h2>加载失败</h2>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="loadPage(currentRoute)">重试</button>
      </div>
    </div>

    <component v-else-if="pageComponent" :is="pageComponent" />
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

.retry-btn {
  background: #1677ff;
  color: #fff;
  border: none;
  padding: 8px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.retry-btn:hover {
  background: #4096ff;
}

.ant-spin-dot-item {
  width: 8px;
  height: 8px;
  background: #1677ff;
  border-radius: 50%;
  display: inline-block;
}

.ant-spin-dot {
  position: relative;
  display: inline-block;
  font-size: 20px;
  width: 20px;
  height: 20px;
}

.ant-spin-dot-item:nth-child(1) {
  position: absolute;
  top: 0;
  left: 0;
  animation: antSpinMove 1s infinite linear;
}

.ant-spin-dot-item:nth-child(2) {
  position: absolute;
  top: 0;
  right: 0;
  animation: antSpinMove 1s infinite linear 0.25s;
}

.ant-spin-dot-item:nth-child(3) {
  position: absolute;
  bottom: 0;
  right: 0;
  animation: antSpinMove 1s infinite linear 0.5s;
}

.ant-spin-dot-item:nth-child(4) {
  position: absolute;
  bottom: 0;
  left: 0;
  animation: antSpinMove 1s infinite linear 0.75s;
}

@keyframes antSpinMove {
  0% {
    transform: scale(0.6);
    opacity: 0.2;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.6);
    opacity: 0.2;
  }
}
</style>