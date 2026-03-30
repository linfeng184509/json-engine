import type { EChartsOption } from 'echarts';

/**
 * ECharts 插件配置
 */
export interface EChartsPluginConfig {
  /** 图表主题 */
  theme?: string | object;
  /** 是否自动调整大小 */
  autoResize?: boolean;
  /** 语言 */
  locale?: string;
}

/**
 * ECharts option 值类型
 */
export interface EChartsOptionValue {
  _type: 'echarts-option';
  option: EChartsOption;
}

/**
 * ECharts 组件 Props
 */
export interface EChartsComponentProps {
  option: EChartsOption | EChartsOptionValue;
  autoResize?: boolean;
  theme?: string | object;
  loading?: boolean;
  width?: string | number;
  height?: string | number;
}