export const axiosConfigSchema = {
  type: 'object',
  properties: {
    baseURL: {
      type: 'string',
      description: 'Base URL for all requests',
    },
    timeout: {
      type: 'number',
      description: 'Request timeout in milliseconds',
      default: 10000,
    },
    headers: {
      type: 'object',
      additionalProperties: { type: 'string' },
      description: 'Default headers for all requests',
    },
    withCredentials: {
      type: 'boolean',
      description: 'Whether to send cookies with requests',
      default: false,
    },
    retry: {
      type: 'object',
      properties: {
        count: { type: 'number', default: 3 },
        delay: { type: 'number', default: 1000 },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};