export const echartsConfigSchema = {
  type: 'object',
  properties: {
    theme: {
      oneOf: [
        { type: 'string' },
        {
          type: 'object',
          additionalProperties: true,
        },
      ],
      description: 'Chart theme, can be a string (built-in theme name) or object (custom theme)',
    },
    autoResize: {
      type: 'boolean',
      description: 'Auto resize chart when container size changes',
      default: true,
    },
    locale: {
      type: 'string',
      description: 'Locale for chart',
    },
  },
  additionalProperties: false,
};