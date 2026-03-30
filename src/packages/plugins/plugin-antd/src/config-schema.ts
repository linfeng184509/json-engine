export const antdConfigSchema = {
  type: 'object',
  properties: {
    theme: {
      type: 'object',
      properties: {
        primaryColor: { type: 'string' },
        borderRadius: { type: 'number' },
      },
      additionalProperties: true,
    },
    components: {
      type: 'array',
      items: { type: 'string' },
      description: 'List of antd components to register',
    },
    locale: {
      type: 'string',
      description: 'Locale for antd components (e.g., zh_CN, en_US)',
      default: 'zh_CN',
    },
  },
  additionalProperties: false,
};
