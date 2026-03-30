export const websocketConfigSchema = {
  type: 'object',
  properties: {
    url: {
      type: 'string',
      description: 'WebSocket server URL',
    },
    autoReconnect: {
      type: 'boolean',
      description: 'Auto reconnect on disconnect',
      default: true,
    },
    reconnectInterval: {
      type: 'number',
      description: 'Reconnect interval in milliseconds',
      default: 3000,
    },
    heartbeatInterval: {
      type: 'number',
      description: 'Heartbeat interval in milliseconds',
      default: 30000,
    },
    topics: {
      type: 'array',
      items: { type: 'string' },
      description: 'Topics to subscribe to',
    },
  },
  required: ['url'],
  additionalProperties: false,
};
