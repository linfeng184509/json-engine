import type { AntdPluginConfig } from '../types';

export interface AntdFactory {
  configureTheme: (theme: AntdPluginConfig['theme']) => void;
  setLocale: (locale: string) => void;
}

export function createAntdFactory(_config: AntdPluginConfig): AntdFactory {
  const configureTheme = (theme: AntdPluginConfig['theme']) => {
    console.log('[antd-factory] Configuring theme:', theme);
  };

  const setLocale = (locale: string) => {
    console.log('[antd-factory] Setting locale:', locale);
  };

  return {
    configureTheme,
    setLocale,
  };
}
