import { describe, it, expect } from 'vitest';
import { createI18nInstance } from './runtime/i18n-factory';

describe('I18nFactory', () => {
  it('should create i18n instance', () => {
    const i18n = createI18nInstance({});
    expect(i18n).toHaveProperty('t');
    expect(i18n).toHaveProperty('setLocale');
    expect(i18n).toHaveProperty('getLocale');
  });

  it('should return key when translation is missing', () => {
    const i18n = createI18nInstance({});
    expect(i18n.t('hello')).toBe('hello');
  });

  it('should use fallback locale when translation missing', () => {
    const i18n = createI18nInstance({
      locale: 'zh',
      fallbackLocale: 'en',
      messages: {
        en: { hello: 'Hello' },
      },
    });

    expect(i18n.t('hello')).toBe('Hello');
  });

  it('should replace params in translation', () => {
    const i18n = createI18nInstance({
      messages: {
        en: { greeting: 'Hello, {name}!' },
      },
    });

    expect(i18n.t('greeting', { name: 'John' })).toBe('Hello, John!');
  });

  it('should set and get locale', () => {
    const i18n = createI18nInstance({ locale: 'en' });

    expect(i18n.getLocale()).toBe('en');

    i18n.setLocale('zh');

    expect(i18n.getLocale()).toBe('zh');
  });

  it('should use default locale when not specified', () => {
    const i18n = createI18nInstance({});
    expect(i18n.getLocale()).toBe('en');
  });

  it('should handle multiple params', () => {
    const i18n = createI18nInstance({
      messages: {
        en: { template: '{greeting}, {name}. You have {count} messages.' },
      },
    });

    expect(i18n.t('template', { greeting: 'Hi', name: 'John', count: 5 }))
      .toBe('Hi, John. You have 5 messages.');
  });
});
