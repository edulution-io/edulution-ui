/*
 * LICENSE PLACEHOLDER
 */

class EventPublisherError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly eventId?: string,
  ) {
    super(message);
    this.name = 'EventPublisherError';
  }
}

export { EventPublisherError };
export default EventPublisherError;
