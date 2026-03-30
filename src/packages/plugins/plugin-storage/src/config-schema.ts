export const storageConfigSchema = {
  type: 'object',
  properties: {
    prefix: {
      type: 'string',
      description: 'Key prefix for storage',
      default: 'vue-json-',
    },
    encrypt: {
      type: 'boolean',
      description: 'Enable encryption',
      default: false,
    },
    encryptKey: {
      type: 'string',
      description: 'Encryption key',
    },
    sync: {
      type: 'boolean',
      description: 'Sync across tabs',
      default: false,
    },
    type: {
      type: 'string',
      enum: ['localStorage', 'sessionStorage'],
      description: 'Storage type',
      default: 'localStorage',
    },
  },
  additionalProperties: false,
};
