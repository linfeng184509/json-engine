import type { I18nPluginConfig, CoreScopeI18n } from '../types';
import { createI18nInstance } from '../runtime/i18n-factory';

export function createI18nScope(config: I18nPluginConfig): CoreScopeI18n {
  return createI18nInstance(config);
}
