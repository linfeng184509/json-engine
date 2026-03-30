export const authConfigSchema = {
  type: 'object',
  properties: {
    permissionProvider: {
      type: 'object',
      description: 'Custom permission provider',
    },
    pagePermissions: {
      type: 'object',
      additionalProperties: { type: 'string' },
      description: 'Page permission mappings',
    },
  },
  additionalProperties: false,
};
