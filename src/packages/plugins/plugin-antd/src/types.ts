export interface AntdPluginConfig {
  theme?: {
    primaryColor?: string;
    borderRadius?: number;
    [key: string]: unknown;
  };
  components?: string[];
  locale?: string;
}

export interface AntdComponentProps {
  [key: string]: unknown;
}

export interface AntdNodeDefinition {
  _type: string;
  props?: AntdComponentProps;
  children?: AntdNodeDefinition[];
}
