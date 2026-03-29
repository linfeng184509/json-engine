import { describe, it, expect, beforeEach } from 'vitest';
import {
  createI18n,
  t,
  setLocale,
  getLocale,
  loadLocaleMessages,
  getAvailableLocales,
  getMessages,
} from '../../src/runtime/i18n-factory';

describe('i18n-factory', () => {
  beforeEach(() => {
    setLocale('en-US');
  });

  describe('createI18n', () => {
    it('should create i18n instance with default config', () => {
      const i18n = createI18n();

      expect(i18n.locale).toBe('en-US');
      expect(typeof i18n.t).toBe('function');
      expect(typeof i18n.setLocale).toBe('function');
    });

    it('should create i18n with custom locale', () => {
      const i18n = createI18n({ locale: 'zh-CN', fallbackLocale: 'en-US' });

      expect(i18n.locale).toBe('zh-CN');
    });

    it('should load messages during creation', () => {
      const i18n = createI18n({
        locale: 'zh-CN',
        messages: {
          'zh-CN': {
            messages: { 'common.save': '保存', 'common.cancel': '取消' },
          },
        },
      });

      expect(i18n.t('common.save')).toBe('保存');
      expect(i18n.t('common.cancel')).toBe('取消');
    });
  });

  describe('t function', () => {
    it('should return key when translation not found', () => {
      expect(t('nonexistent.key')).toBe('nonexistent.key');
    });

    it('should return translation when found', () => {
      loadLocaleMessages('en-US', { greeting: 'Hello' });
      expect(t('greeting')).toBe('Hello');
    });

    it('should replace parameters', () => {
      loadLocaleMessages('en-US', { 'greeting.name': 'Hello, {name}!' });
      expect(t('greeting.name', { name: 'John' })).toBe('Hello, John!');
    });

    it('should fall back to fallbackLocale when key not found', () => {
      loadLocaleMessages('en-US', { greeting: 'Hello' });
      setLocale('fr-FR');

      expect(t('greeting')).toBe('Hello');
    });
  });

  describe('setLocale', () => {
    it('should change current locale', () => {
      loadLocaleMessages('fr-FR', { greeting: 'Bonjour' });

      setLocale('fr-FR');
      expect(getLocale()).toBe('fr-FR');
      expect(t('greeting')).toBe('Bonjour');
    });
  });

  describe('getLocale', () => {
    it('should return current locale', () => {
      setLocale('de-DE');
      expect(getLocale()).toBe('de-DE');
    });
  });

  describe('loadLocaleMessages', () => {
    it('should load and merge messages', () => {
      loadLocaleMessages('ja-JP', { hello: 'こんにちは' });
      loadLocaleMessages('ja-JP', { goodbye: 'さようなら' });

      const messages = getMessages('ja-JP');
      expect(messages).toEqual({ hello: 'こんにちは', goodbye: 'さようなら' });
    });
  });

  describe('getAvailableLocales', () => {
    it('should return list of loaded locales', () => {
      loadLocaleMessages('en-US', {});
      loadLocaleMessages('zh-CN', {});
      loadLocaleMessages('ja-JP', {});

      const locales = getAvailableLocales();
      expect(locales).toContain('en-US');
      expect(locales).toContain('zh-CN');
      expect(locales).toContain('ja-JP');
    });
  });

  describe('getMessages', () => {
    it('should return undefined for non-existent locale', () => {
      expect(getMessages('non-existent')).toBeUndefined();
    });

    it('should return messages for existing locale', () => {
      loadLocaleMessages('ko-KR', { thank_you: '감사합니다' });
      expect(getMessages('ko-KR')).toEqual({ thank_you: '감사합니다' });
    });
  });
});