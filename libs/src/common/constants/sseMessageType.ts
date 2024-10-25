const SSE_MESSAGE_TYPE = {
  CREATED: 'created',
  UPDATED: 'updated',
  STARTED: 'started',
  STOPPED: 'stopped',
  DELETED: 'deleted',
  MESSAGE: 'message',
} as const;

export default SSE_MESSAGE_TYPE;
