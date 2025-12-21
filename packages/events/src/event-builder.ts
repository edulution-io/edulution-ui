/*
 * LICENSE PLACEHOLDER
 */

import { randomUUID } from 'crypto';
import { SCHEMA_VERSION } from './constants';
import { validateEvent, ValidationError } from './validation';
import {
  type Event,
  EVENT_SENSITIVITY,
  type EventContext,
  type EventInput,
  type EventMetadata,
  type EventObject,
  type EventPayload,
  type EventSensitivity,
  type EventSource,
} from './types';

function generateEventId(): string {
  return randomUUID();
}

function generateCorrelationId(): string {
  return `corr-${randomUUID()}`;
}

function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export class EventBuilder {
  private eventData: Partial<Event> = {};

  constructor() {
    this.reset();
  }

  private reset(): void {
    this.eventData = {
      schema_version: SCHEMA_VERSION,
      sensitivity: EVENT_SENSITIVITY.LOW,
      context: {},
      metadata: {},
      payload: {},
    };
  }

  static create(): EventBuilder {
    return new EventBuilder();
  }

  static fromInput(input: EventInput): EventBuilder {
    const builder = new EventBuilder();
    return builder
      .withUserId(input.user_id)
      .withSource(input.source)
      .withType(input.type)
      .withObject(input.object)
      .withOccurredAt(input.occurred_at)
      .withTenantId(input.tenant_id)
      .withActorId(input.actor_id)
      .withContext(input.context)
      .withCorrelationId(input.correlation_id)
      .withCausationId(input.causation_id)
      .withSensitivity(input.sensitivity)
      .withMetadata(input.metadata)
      .withPayload(input.payload);
  }

  static chain(parentEvent: Event): EventBuilder {
    const builder = new EventBuilder();
    return builder
      .withCorrelationId(parentEvent.correlation_id)
      .withCausationId(parentEvent.event_id)
      .withTenantId(parentEvent.tenant_id)
      .withContext(parentEvent.context);
  }

  withUserId(userId: string): this {
    this.eventData.user_id = userId;
    return this;
  }

  withSource(source: EventSource): this {
    this.eventData.source = source;
    return this;
  }

  withType(type: string): this {
    this.eventData.type = type;
    return this;
  }

  withObject(object: EventObject): this {
    this.eventData.object = object;
    return this;
  }

  withObjectType(objectType: string): this {
    this.eventData.object = {
      ...this.eventData.object,
      object_type: objectType,
    } as EventObject;
    return this;
  }

  withObjectId(objectId: string): this {
    this.eventData.object = {
      ...this.eventData.object,
      object_id: objectId,
    } as EventObject;
    return this;
  }

  withObjectRef(objectRef: string | null): this {
    this.eventData.object = {
      ...this.eventData.object,
      object_ref: objectRef,
    } as EventObject;
    return this;
  }

  withOccurredAt(occurredAt?: string): this {
    if (occurredAt) {
      this.eventData.occurred_at = occurredAt;
    }
    return this;
  }

  withTenantId(tenantId?: string | null): this {
    this.eventData.tenant_id = tenantId ?? null;
    return this;
  }

  withActorId(actorId?: string | null): this {
    this.eventData.actor_id = actorId ?? null;
    return this;
  }

  withContext(context?: EventContext): this {
    if (context) {
      this.eventData.context = { ...this.eventData.context, ...context };
    }
    return this;
  }

  withContextId(contextId: string): this {
    this.eventData.context = { ...this.eventData.context, context_id: contextId };
    return this;
  }

  withProjectId(projectId?: string): this {
    if (projectId) {
      this.eventData.context = { ...this.eventData.context, project_id: projectId };
    }
    return this;
  }

  withThreadId(threadId: string): this {
    this.eventData.context = { ...this.eventData.context, thread_id: threadId };
    return this;
  }

  withMeetingId(meetingId: string): this {
    this.eventData.context = { ...this.eventData.context, meeting_id: meetingId };
    return this;
  }

  withSessionId(sessionId: string): this {
    this.eventData.context = { ...this.eventData.context, session_id: sessionId };
    return this;
  }

  withRequestId(requestId: string): this {
    this.eventData.context = { ...this.eventData.context, request_id: requestId };
    return this;
  }

  withCorrelationId(correlationId?: string): this {
    if (correlationId) {
      this.eventData.correlation_id = correlationId;
    }
    return this;
  }

  withCausationId(causationId?: string | null): this {
    this.eventData.causation_id = causationId ?? null;
    return this;
  }

  withSensitivity(sensitivity?: EventSensitivity): this {
    if (sensitivity) {
      this.eventData.sensitivity = sensitivity;
    }
    return this;
  }

  withMetadata(metadata?: EventMetadata): this {
    if (metadata) {
      this.eventData.metadata = { ...this.eventData.metadata, ...metadata };
    }
    return this;
  }

  addMetadata(key: string, value: string | number | boolean | null): this {
    this.eventData.metadata = { ...this.eventData.metadata, [key]: value };
    return this;
  }

  withPayload(payload?: EventPayload): this {
    if (payload) {
      this.eventData.payload = { ...this.eventData.payload, ...payload };
    }
    return this;
  }

  addPayload(key: string, value: unknown): this {
    this.eventData.payload = { ...this.eventData.payload, [key]: value };
    return this;
  }

  build(): Event {
    const now = getCurrentTimestamp();

    const event: Event = {
      event_id: generateEventId(),
      schema_version: this.eventData.schema_version || SCHEMA_VERSION,
      occurred_at: this.eventData.occurred_at || now,
      received_at: now,
      tenant_id: this.eventData.tenant_id ?? null,
      user_id: this.eventData.user_id!,
      source: this.eventData.source!,
      type: this.eventData.type!,
      actor_id: this.eventData.actor_id ?? null,
      object: this.eventData.object!,
      context: this.eventData.context || {},
      correlation_id: this.eventData.correlation_id || generateCorrelationId(),
      causation_id: this.eventData.causation_id ?? null,
      sensitivity: this.eventData.sensitivity || EVENT_SENSITIVITY.LOW,
      metadata: this.eventData.metadata || {},
      payload: this.eventData.payload || {},
    };

    const validated = validateEvent(event);

    this.reset();

    return validated as Event;
  }

  buildUnsafe(): Event {
    const now = getCurrentTimestamp();

    const event: Event = {
      event_id: generateEventId(),
      schema_version: this.eventData.schema_version || SCHEMA_VERSION,
      occurred_at: this.eventData.occurred_at || now,
      received_at: now,
      tenant_id: this.eventData.tenant_id ?? null,
      user_id: this.eventData.user_id!,
      source: this.eventData.source!,
      type: this.eventData.type!,
      actor_id: this.eventData.actor_id ?? null,
      object: this.eventData.object!,
      context: this.eventData.context || {},
      correlation_id: this.eventData.correlation_id || generateCorrelationId(),
      causation_id: this.eventData.causation_id ?? null,
      sensitivity: this.eventData.sensitivity || EVENT_SENSITIVITY.LOW,
      metadata: this.eventData.metadata || {},
      payload: this.eventData.payload || {},
    };

    this.reset();

    return event;
  }

  tryBuild(): { success: true; event: Event } | { success: false; error: ValidationError } {
    try {
      const event = this.build();
      return { success: true, event };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error };
      }
      throw error;
    }
  }
}

export default EventBuilder;
