export interface I18nPluginConfig {
  locale?: string;
  fallbackLocale?: string;
  messages?: Record<string, Record<string, string>>;
}

export interface CoreScopeI18n {
  t: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (locale: string) => void;
  getLocale: () => string;
}
