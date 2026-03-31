import { createApp } from 'vue'
import App from './App.vue'
import 'ant-design-vue/dist/reset.css'
import { getAntdComponents } from '@json-engine/plugin-antd'

const app = createApp(App)

const antdComponents = getAntdComponents()
for (const [name, component] of Object.entries(antdComponents)) {
  app.component(name, component)
}

app.mount('#app')