/*
 * LICENSE PLACEHOLDER
 */

import {
  EventBuilder,
  EVENT_SOURCES,
  FILE_EVENT_TYPES,
  EVENT_SENSITIVITY,
  ValidationError,
} from '@edulution/events';

describe('EventBuilder', () => {
  describe('create()', () => {
    it('should create a valid event with required fields', () => {
      const event = EventBuilder.create()
        .withUserId('user-123')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({
          object_type: 'file',
          object_id: 'file-456',
        })
        .build();

      expect(event.event_id).toBeDefined();
      expect(event.event_id).toMatch(/^[0-9a-f-]{36}$/);
      expect(event.user_id).toBe('user-123');
      expect(event.source).toBe('files');
      expect(event.type).toBe('file.created');
      expect(event.object.object_type).toBe('file');
      expect(event.object.object_id).toBe('file-456');
      expect(event.schema_version).toBe('1.0.0');
      expect(event.sensitivity).toBe('low');
    });

    it('should auto-generate event_id', () => {
      const event1 = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .build();

      const event2 = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .build();

      expect(event1.event_id).not.toBe(event2.event_id);
    });

    it('should auto-generate received_at timestamp', () => {
      const before = new Date().toISOString();

      const event = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .build();

      const after = new Date().toISOString();

      expect(event.received_at >= before).toBe(true);
      expect(event.received_at <= after).toBe(true);
    });

    it('should auto-generate correlation_id if not provided', () => {
      const event = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .build();

      expect(event.correlation_id).toBeDefined();
      expect(event.correlation_id).toMatch(/^corr-[0-9a-f-]+$/);
    });

    it('should use provided correlation_id', () => {
      const event = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .withCorrelationId('my-custom-correlation')
        .build();

      expect(event.correlation_id).toBe('my-custom-correlation');
    });
  });

  describe('metadata and payload', () => {
    it('should add metadata correctly', () => {
      const event = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .addMetadata('file_size', 1024)
        .addMetadata('mime_type', 'text/plain')
        .addMetadata('is_public', false)
        .build();

      expect(event.metadata?.file_size).toBe(1024);
      expect(event.metadata?.mime_type).toBe('text/plain');
      expect(event.metadata?.is_public).toBe(false);
    });

    it('should merge metadata with withMetadata', () => {
      const event = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .withMetadata({ key1: 'value1' })
        .withMetadata({ key2: 'value2' })
        .build();

      expect(event.metadata?.key1).toBe('value1');
      expect(event.metadata?.key2).toBe('value2');
    });
  });

  describe('context', () => {
    it('should set context fields correctly', () => {
      const event = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .withContextId('ctx-1')
        .withProjectId('proj-1')
        .withThreadId('thread-1')
        .withMeetingId('meeting-1')
        .withSessionId('session-1')
        .withRequestId('request-1')
        .build();

      expect(event.context?.context_id).toBe('ctx-1');
      expect(event.context?.project_id).toBe('proj-1');
      expect(event.context?.thread_id).toBe('thread-1');
      expect(event.context?.meeting_id).toBe('meeting-1');
      expect(event.context?.session_id).toBe('session-1');
      expect(event.context?.request_id).toBe('request-1');
    });
  });

  describe('chain()', () => {
    it('should chain events with correlation and causation', () => {
      const parentEvent = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .withCorrelationId('parent-correlation')
        .withTenantId('tenant-1')
        .withContextId('ctx-1')
        .build();

      const childEvent = EventBuilder.chain(parentEvent)
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.MOVED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .build();

      expect(childEvent.correlation_id).toBe('parent-correlation');
      expect(childEvent.causation_id).toBe(parentEvent.event_id);
      expect(childEvent.tenant_id).toBe('tenant-1');
      expect(childEvent.context?.context_id).toBe('ctx-1');
    });
  });

  describe('fromInput()', () => {
    it('should build event from input object', () => {
      const input = {
        user_id: 'user-1',
        source: EVENT_SOURCES.FILES,
        type: FILE_EVENT_TYPES.CREATED,
        object: { object_type: 'file', object_id: 'f1' },
        sensitivity: EVENT_SENSITIVITY.MEDIUM,
      };

      const event = EventBuilder.fromInput(input).build();

      expect(event.user_id).toBe('user-1');
      expect(event.source).toBe('files');
      expect(event.type).toBe('file.created');
      expect(event.sensitivity).toBe('medium');
    });
  });

  describe('validation', () => {
    it('should throw ValidationError for invalid event type format', () => {
      expect(() => {
        EventBuilder.create()
          .withUserId('user-1')
          .withSource(EVENT_SOURCES.FILES)
          .withType('invalid-type')
          .withObject({ object_type: 'file', object_id: 'f1' })
          .build();
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing required fields', () => {
      expect(() => {
        EventBuilder.create()
          .withSource(EVENT_SOURCES.FILES)
          .withType(FILE_EVENT_TYPES.CREATED)
          .withObject({ object_type: 'file', object_id: 'f1' })
          .build();
      }).toThrow(ValidationError);
    });

    it('should return error in tryBuild for invalid events', () => {
      const result = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType('bad-format')
        .withObject({ object_type: 'file', object_id: 'f1' })
        .tryBuild();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
    });

    it('buildUnsafe should not throw for invalid events', () => {
      const event = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType('bad-format')
        .withObject({ object_type: 'file', object_id: 'f1' })
        .buildUnsafe();

      expect(event.type).toBe('bad-format');
    });
  });

  describe('sensitivity levels', () => {
    it('should default to low sensitivity', () => {
      const event = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .build();

      expect(event.sensitivity).toBe('low');
    });

    it('should allow setting sensitivity levels', () => {
      const lowEvent = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .withSensitivity(EVENT_SENSITIVITY.LOW)
        .build();

      const mediumEvent = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
        .build();

      const highEvent = EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .withSensitivity(EVENT_SENSITIVITY.HIGH)
        .build();

      expect(lowEvent.sensitivity).toBe('low');
      expect(mediumEvent.sensitivity).toBe('medium');
      expect(highEvent.sensitivity).toBe('high');
    });
  });
});
