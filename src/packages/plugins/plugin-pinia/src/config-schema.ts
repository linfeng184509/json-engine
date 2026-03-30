export const piniaConfigSchema = {
  type: 'object',
  properties: {
    persist: {
      type: 'boolean',
      description: 'Persist state to storage',
      default: false,
    },
    storage: {
      type: 'string',
      enum: ['localStorage', 'sessionStorage'],
      description: 'Storage type for persistence',
      default: 'localStorage',
    },
    key: {
      type: 'string',
      description: 'Storage key for persistence',
      default: 'pinia-state',
    },
  },
  additionalProperties: false,
};
