import type { I18nConfig } from '../types/app';

let currentLocale = 'en-US';
let fallbackLocale = 'en-US';
const messages: Record<string, Record<string, string>> = {};
const subscribers: Array<() => void> = [];

export function createI18n(config?: I18nConfig): {
  locale: string;
  t: (key: string, params?: Record<string, string>) => string;
  setLocale: (locale: string) => void;
} {
  if (config) {
    if (config.locale) {
      currentLocale = config.locale;
    }
    if (config.fallbackLocale) {
      fallbackLocale = config.fallbackLocale;
    }
    if (config.messages) {
      for (const [locale, localeConfig] of Object.entries(config.messages)) {
        loadLocaleMessages(locale, localeConfig.messages);
      }
    }
  }

  return {
    locale: currentLocale,
    t: translate,
    setLocale,
  };
}

export function loadLocaleMessages(locale: string, newMessages: Record<string, string>): void {
  if (!messages[locale]) {
    messages[locale] = {};
  }
  Object.assign(messages[locale], newMessages);
}

export function setLocale(locale: string): void {
  if (locale === currentLocale) return;
  currentLocale = locale;
  notifySubscribers();
}

export function getLocale(): string {
  return currentLocale;
}

export function t(key: string, params?: Record<string, string>): string {
  return translate(key, params);
}

function translate(key: string, params?: Record<string, string>): string {
  let text = getMessage(currentLocale, key);

  if (!text && fallbackLocale !== currentLocale) {
    text = getMessage(fallbackLocale, key);
  }

  if (!text) {
    return key;
  }

  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
    }
  }

  return text;
}

function getMessage(locale: string, key: string): string | undefined {
  const localeMessages = messages[locale];
  if (!localeMessages) return undefined;
  return localeMessages[key];
}

function notifySubscribers(): void {
  for (const subscriber of subscribers) {
    subscriber();
  }
}

export function subscribeLocaleChanges(callback: () => void): () => void {
  subscribers.push(callback);
  return () => {
    const idx = subscribers.indexOf(callback);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}

export function getAvailableLocales(): string[] {
  return Object.keys(messages);
}

export function getMessages(locale: string): Record<string, string> | undefined {
  return messages[locale];
}