import type { ExpressionValue, StateRef, PropsRef } from './schema';

type EChartsOption = Record<string, unknown>;

/**
 * ECharts 图表配置值类型
 * 用于在 JSON Schema 中声明 ECharts 配置
 */
export interface EChartsOptionValue {
  _type: 'echarts-option';
  option: EChartsOption | StateRef | PropsRef | ExpressionValue;
  autoResize?: boolean;
  theme?: string | object;
}

/**
 * ECharts 组件 Props 定义
 */
export interface EChartsComponentProps {
  /**
   * ECharts 配置对象
   * 可以是完整的 option 对象，也可以是引用
   */
  option: EChartsOption | EChartsOptionValue | StateRef | PropsRef | ExpressionValue;
  /**
   * 是否启用容器大小自适应
   * @default false
   */
  autoResize?: boolean;
  /**
   * 图表主题
   * 可以是内置主题名（'dark' | 'light'）或自定义主题对象
   */
  theme?: string | object;
  /**
   * 是否显示加载动画
   * @default false
   */
  loading?: boolean;
  /**
   * 图表宽度
   */
  width?: string | number;
  /**
   * 图表高度
   */
  height?: string | number;
}

/**
 * ECharts 节点定义（用于 render 模板）
 */
export interface EChartsNodeDefinition {
  type: 'ECharts';
  props: {
    option: EChartsOptionValue | StateRef | PropsRef | ExpressionValue;
    autoResize?: boolean;
    theme?: string;
    loading?: boolean;
    width?: string | number;
    height?: string | number;
  };
}
