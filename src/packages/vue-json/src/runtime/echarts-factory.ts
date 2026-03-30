type EChartsModule = {
  init: (dom: HTMLElement, theme?: string | object, opts?: any) => any;
  version?: string;
};

export interface EChartsInstance {
  chart: any;
  container: HTMLElement;
  resizeObserver?: ResizeObserver;
  dispose: () => void;
}

let echarts: EChartsModule | null = null;
let echartsCheckDone = false;
let echartsAvailable = false;

export function getEcharts(): EChartsModule | null {
  if (echarts) {
    return echarts;
  }

  try {
    echarts = require('echarts');
    return echarts;
  } catch {
    return null;
  }
}

export function isEChartsAvailable(): boolean {
  if (echartsCheckDone) {
    return echartsAvailable;
  }
  echartsCheckDone = true;
  echartsAvailable = getEcharts() !== null;
  return echartsAvailable;
}

export function initECharts(
  container: HTMLElement,
  theme?: string | object,
  opts?: { width?: number | string; height?: number | string }
): EChartsInstance | null {
  const lib = getEcharts();
  if (!lib) {
    return null;
  }

  try {
    const chart = lib.init(container, theme, opts);
    let resizeObserver: ResizeObserver | undefined;

    return {
      chart,
      container,
      resizeObserver: undefined,
      dispose: () => {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        if (chart && !chart.isDisposed()) {
          chart.dispose();
        }
      },
    };
  } catch (error) {
    console.error('[vue-json] Failed to initialize ECharts:', error);
    return null;
  }
}

export function setupAutoResize(
  instance: EChartsInstance,
  callback?: () => void
): void {
  if (typeof ResizeObserver === 'undefined') {
    console.warn('[vue-json] ResizeObserver not supported in this browser');
    return;
  }

  instance.resizeObserver = new ResizeObserver(() => {
    if (instance.chart && !instance.chart.isDisposed()) {
      instance.chart.resize();
      callback?.();
    }
  });

  instance.resizeObserver.observe(instance.container);
}

export function disposeECharts(instance: EChartsInstance): void {
  instance.dispose();
}

export function setOption(
  instance: EChartsInstance,
  option: any,
  notMerge: boolean = false
): void {
  if (!instance.chart || instance.chart.isDisposed()) {
    console.warn('[vue-json] Cannot set option on disposed chart');
    return;
  }

  try {
    instance.chart.setOption(option, { notMerge });
  } catch (error) {
    console.error('[vue-json] Failed to set chart option:', error);
  }
}

export function showLoading(instance: EChartsInstance): void {
  if (instance.chart && !instance.chart.isDisposed()) {
    instance.chart.showLoading();
  }
}

export function hideLoading(instance: EChartsInstance): void {
  if (instance.chart && !instance.chart.isDisposed()) {
    instance.chart.hideLoading();
  }
}

export function getEChartsVersion(): string | null {
  const lib = getEcharts();
  if (!lib) {
    return null;
  }
  return lib.version || 'unknown';
}
