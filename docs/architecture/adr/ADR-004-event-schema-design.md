# ADR-004: Event Schema Design

## Status

Accepted

## Context

The Event Logging System needs a consistent event schema that:

- Supports multiple event sources (files, mail, chat, conferences, calendar)
- Enables correlation across services
- Supports privacy/sensitivity requirements
- Is extensible for future event types
- Enables efficient querying and aggregation

## Decision

We adopt a **canonical event schema** with standardized fields:

### Core fields (required):

```typescript
interface Event {
  event_id: string;        // UUID v4, globally unique
  schema_version: string;  // Semver, e.g., "1.0.0"
  occurred_at: string;     // ISO 8601 timestamp
  received_at: string;     // ISO 8601 timestamp (server time)
  user_id: string;         // Primary user associated with event
  source: EventSource;     // files | mail | chat | conferences | caldav
  type: string;            // Format: "domain.action"
  object: EventObject;     // What the event is about
  correlation_id: string;  // For tracing related events
  sensitivity: Sensitivity; // low | medium | high
}
```

### Optional fields:

```typescript
interface EventOptional {
  tenant_id?: string;     // Multi-tenancy support
  actor_id?: string;      // Who performed the action (if different from user_id)
  context?: EventContext; // Additional context (project, thread, etc.)
  causation_id?: string;  // Parent event that caused this
  metadata?: EventMetadata; // Structured key-value data
  payload?: EventPayload;   // Source-specific data (must follow redaction rules)
}
```

### Event type format:

```
{domain}.{action}

Examples:
- file.created
- file.moved
- mail.received
- mail.replied
- conference.started
- chat.message_sent
```

### Object structure:

```typescript
interface EventObject {
  object_type: string;  // file, folder, email, message, meeting
  object_id: string;    // Unique identifier within source
  object_ref?: string;  // Human-readable reference (path, URL)
}
```

## Alternatives Considered

### 1. CloudEvents specification

**Pros:**
- Industry standard
- Wide tooling support
- Well-documented

**Cons:**
- Extension model is complex
- Some fields don't map well to our use case
- Would require custom extensions anyway

### 2. Flat event structure

**Approach**: All fields at top level, no nesting

**Pros:**
- Simpler serialization
- Easier querying

**Cons:**
- Field name collisions across sources
- No logical grouping
- Harder to evolve

### 3. Source-specific schemas

**Approach**: Different schema per event source

**Pros:**
- Optimized for each source
- No unused fields

**Cons:**
- Harder to build generic tooling
- Correlation more complex
- Schema explosion

### 4. Protobuf/Avro schemas

**Pros:**
- Binary format, smaller size
- Strong typing
- Schema evolution support

**Cons:**
- Additional complexity
- Requires schema registry
- Less human-readable for debugging

## Trade-offs

### Accepted trade-offs:

1. **Schema overhead**: Every event carries common fields even if not all are used
2. **String-based types**: Using strings for type allows flexibility but less compile-time safety
3. **JSON format**: Larger than binary, but human-readable and widely supported

### Benefits gained:

1. **Consistency**: All events follow same structure
2. **Evolvability**: schema_version enables migration
3. **Correlation**: Built-in correlation_id and causation_id
4. **Privacy-aware**: Explicit sensitivity field
5. **Type safety**: Zod validation at boundaries

## Validation

Using Zod for runtime validation:

```typescript
const EventSchema = z.object({
  event_id: z.string().uuid(),
  schema_version: z.string().regex(/^\d+\.\d+\.\d+$/),
  occurred_at: z.string().datetime(),
  received_at: z.string().datetime(),
  user_id: z.string().min(1).max(255),
  source: z.enum(['files', 'mail', 'chat', 'conferences', 'caldav', 'http', 'system']),
  type: z.string().regex(/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/),
  object: EventObjectSchema,
  correlation_id: z.string().min(1),
  sensitivity: z.enum(['low', 'medium', 'high']),
  // ... optional fields
});
```

## Event Type Registry

Predefined event types per source:

| Source      | Event Types                                              |
|-------------|----------------------------------------------------------|
| files       | file.created, file.moved, file.copied, file.deleted, file.accessed |
| mail        | mail.received, mail.sent, mail.replied, mail.forwarded   |
| chat        | chat.message_sent, chat.message_received, chat.channel_joined |
| conferences | conference.created, conference.started, conference.ended |
| caldav      | calendar.event_created, calendar.event_started           |

## Consequences

1. All publishers must conform to schema
2. New event types require updating type constants
3. Schema changes require version bump
4. Validation overhead on every event ingestion

## References

- [CloudEvents Specification](https://cloudevents.io/)
- [Event Sourcing patterns](https://microservices.io/patterns/data/event-sourcing.html)
- [Zod documentation](https://zod.dev/)
