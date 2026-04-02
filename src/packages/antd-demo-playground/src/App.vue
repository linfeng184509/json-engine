<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { setupApp } from './setup-app';
import appSchema from '../public/schemas/app.json';

onMounted(async () => {
  await setupApp(appSchema as any);
});
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
}
</style>