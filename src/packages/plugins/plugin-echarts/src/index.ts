export { echartsPlugin as default, echartsPlugin } from './plugin';
export { EChartsComponent } from './components/EChartsComponent';
export { createEChartsOptionParser } from './parser/echarts-option-parser';
export { initECharts, setupAutoResize, disposeECharts } from './runtime/echarts-factory';
export type { EChartsPluginConfig, EChartsOptionValue, EChartsComponentProps } from './types';