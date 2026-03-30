export const routerConfigSchema = {
  type: 'object',
  properties: {
    mode: {
      type: 'string',
      enum: ['hash', 'history'],
      description: 'Router mode',
      default: 'hash',
    },
    base: {
      type: 'string',
      description: 'Base URL for router',
      default: '/',
    },
    scrollBehavior: {
      type: 'string',
      enum: ['top', 'bottom', 'preserve'],
      description: 'Scroll behavior on navigation',
    },
  },
  additionalProperties: false,
};
