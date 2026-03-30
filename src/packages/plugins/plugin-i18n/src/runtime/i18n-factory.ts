import type { I18nPluginConfig } from '../types';

export interface I18nInstance {
  t: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (locale: string) => void;
  getLocale: () => string;
}

export function createI18nInstance(config: I18nPluginConfig): I18nInstance {
  let currentLocale = config.locale || 'en';
  const fallbackLocale = config.fallbackLocale || 'en';
  const messages = config.messages || {};

  const t = (key: string, params?: Record<string, string | number>): string => {
    const localeMessages = messages[currentLocale] || messages[fallbackLocale] || {};
    let text = localeMessages[key] || messages[fallbackLocale]?.[key] || key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }

    return text;
  };

  const setLocale = (locale: string) => {
    currentLocale = locale;
    console.log(`[i18n] Locale changed to: ${locale}`);
  };

  const getLocale = () => currentLocale;

  return { t, setLocale, getLocale };
}
