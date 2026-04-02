export interface AntdPluginConfig {
  theme?: {
    primaryColor?: string;
    borderRadius?: number;
    [key: string]: unknown;
  };
  components?: string[];
  locale?: string;
  includeIcons?: boolean;
}

export interface AntdComponentProps {
  [key: string]: unknown;
}

export interface AntdNodeDefinition {
  _type: string;
  props?: AntdComponentProps;
  children?: AntdNodeDefinition[];
}

export interface AntdModalApi {
  confirm: (config: Record<string, unknown>) => { destroy: () => void; update: (config: Record<string, unknown>) => void };
  info: (config: Record<string, unknown>) => { destroy: () => void };
  success: (config: Record<string, unknown>) => { destroy: () => void };
  error: (config: Record<string, unknown>) => { destroy: () => void };
  warning: (config: Record<string, unknown>) => { destroy: () => void };
  destroyAll: () => void;
}

export interface AntdMessageApi {
  success: (content: string | Record<string, unknown>) => void;
  error: (content: string | Record<string, unknown>) => void;
  warning: (content: string | Record<string, unknown>) => void;
  info: (content: string | Record<string, unknown>) => void;
  loading: (content: string | Record<string, unknown>) => void;
}

export interface AntdNotificationApi {
  success: (config: Record<string, unknown>) => void;
  error: (config: Record<string, unknown>) => void;
  warning: (config: Record<string, unknown>) => void;
  info: (config: Record<string, unknown>) => void;
}

export interface AntdScope {
  message: AntdMessageApi;
  notification: AntdNotificationApi;
  modal: AntdModalApi;
}
