export const i18nConfigSchema = {
  type: 'object',
  properties: {
    locale: {
      type: 'string',
      description: 'Current locale',
      default: 'en',
    },
    fallbackLocale: {
      type: 'string',
      description: 'Fallback locale when translation is missing',
      default: 'en',
    },
    messages: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        additionalProperties: { type: 'string' },
      },
      description: 'Translation messages by locale',
    },
  },
  additionalProperties: false,
};
