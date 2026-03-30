import type { VueJsonPlugin } from '@json-engine/vue-json';
import { echartsConfigSchema } from './config-schema';
import { createEChartsOptionParser } from './parser/echarts-option-parser';
import { EChartsComponent } from './components/EChartsComponent';
import { initECharts, setupAutoResize, disposeECharts } from './runtime/echarts-factory';

export const echartsPlugin: VueJsonPlugin = {
  name: '@json-engine/plugin-echarts',
  version: '0.0.1',
  description: 'ECharts integration for vue-json',

  configSchema: echartsConfigSchema,

  valueTypes: [
    {
      typeName: 'echarts-option',
      parser: createEChartsOptionParser(),
      requiresBody: true,
    },
  ],

  components: [
    {
      name: 'ECharts',
      component: EChartsComponent,
    },
  ],

  runtimeExports: [
    {
      name: 'initECharts',
      factory: initECharts,
    },
    {
      name: 'setupAutoResize',
      factory: setupAutoResize,
    },
    {
      name: 'disposeECharts',
      factory: disposeECharts,
    },
  ],

  onInstall(context) {
    const config = context.config as { theme?: string | object; autoResize?: boolean };
    console.log(`[plugin-echarts] Installed with config:`, config);
  },
};

export default echartsPlugin;