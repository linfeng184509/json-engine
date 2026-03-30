import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  watch,
  h,
  type PropType,
  markRaw,
} from 'vue';
import { getEcharts } from '../runtime/echarts-factory';

type EChartsOption = Record<string, unknown>;

export function initEChartsComponent(registry?: Map<string, unknown>): boolean {
  const lib = getEcharts();
  if (!lib) {
    return false;
  }
  if (registry && !registry.has('ECharts')) {
    registry.set('ECharts', EChartsComponent);
  }
  return true;
}

export interface EChartsComponentProps {
  option: EChartsOption | any;
  autoResize?: boolean;
  theme?: string | object;
  loading?: boolean;
  width?: string | number;
  height?: string | number;
}

export const EChartsComponent = defineComponent({
  name: 'ECharts',

  props: {
    option: {
      type: [Object, Array] as PropType<EChartsComponentProps['option']>,
      required: true,
    },
    autoResize: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: [String, Object] as PropType<string | object>,
      default: undefined,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    width: {
      type: [String, Number],
      default: undefined,
    },
    height: {
      type: [String, Number],
      default: undefined,
    },
  },

  emits: ['ready', 'updated', 'error'],

  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLElement | null>(null);
    const chartInstance = ref<any>(null);
    let resizeObserver: ResizeObserver | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const DEBOUNCE_DELAY = 300;

    function initChart() {
      const lib = getEcharts();
      if (!lib || !containerRef.value) {
        if (!lib) {
          console.warn(
            '[vue-json] ECharts not installed. Please install echarts package: npm install echarts'
          );
        }
        return;
      }

      try {
        const option = normalizeOption(props.option);
        chartInstance.value = markRaw(
          lib.init(containerRef.value, props.theme, {
            width: props.width,
            height: props.height,
          })
        );

        chartInstance.value.setOption(option);

        if (props.loading) {
          chartInstance.value.showLoading();
        }

        emit('ready', chartInstance.value);
      } catch (error) {
        console.error('[ECharts] Failed to initialize chart:', error);
        emit('error', error);
      }
    }

    function updateChart(newOption: any) {
      if (!chartInstance.value || chartInstance.value.isDisposed()) {
        return;
      }

      try {
        if (props.loading) {
          chartInstance.value.hideLoading();
        }

        chartInstance.value.setOption(newOption, { notMerge: false });
        emit('updated', chartInstance.value);
      } catch (error) {
        console.error('[ECharts] Failed to update chart:', error);
        emit('error', error);
      }
    }

    const debouncedUpdate = (newOption: any) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        updateChart(newOption);
        debounceTimer = null;
      }, DEBOUNCE_DELAY);
    };

    function normalizeOption(opt: any): EChartsOption {
      if (opt && typeof opt === 'object' && '_type' in opt && opt._type === 'echarts-option') {
        return opt.option as EChartsOption;
      }
      return opt as EChartsOption;
    }

    function setupResizeObserver() {
      if (!props.autoResize || !chartInstance.value || !containerRef.value) {
        return;
      }

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          if (chartInstance.value && !chartInstance.value.isDisposed()) {
            chartInstance.value.resize();
          }
        });

        resizeObserver.observe(containerRef.value);
      } else {
        console.warn('[ECharts] ResizeObserver not supported in this browser');
      }
    }

    function cleanup() {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }

      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }

      if (chartInstance.value) {
        if (!chartInstance.value.isDisposed()) {
          chartInstance.value.dispose();
        }
        chartInstance.value = null;
      }
    }

    watch(
      () => props.option,
      (newOption) => {
        const normalized = normalizeOption(newOption);

        if (chartInstance.value && !chartInstance.value.isDisposed()) {
          debouncedUpdate(normalized);
        } else {
          initChart();
        }
      },
      { deep: true }
    );

    watch(
      () => props.loading,
      (newLoading) => {
        if (chartInstance.value && !chartInstance.value.isDisposed()) {
          if (newLoading) {
            chartInstance.value.showLoading();
          } else {
            chartInstance.value.hideLoading();
          }
        }
      }
    );

    onMounted(() => {
      initChart();
      setupResizeObserver();
    });

    onUnmounted(() => {
      cleanup();
    });

    expose({
      getChart: () => chartInstance.value,
      resize: () => {
        if (chartInstance.value && !chartInstance.value.isDisposed()) {
          chartInstance.value.resize();
        }
      },
    });

    return () =>
      h('div', {
        ref: containerRef,
        style: {
          width: typeof props.width === 'number' ? `${props.width}px` : props.width || '100%',
          height: typeof props.height === 'number' ? `${props.height}px` : props.height || '400px',
        },
      });
  },
});

export default EChartsComponent;
