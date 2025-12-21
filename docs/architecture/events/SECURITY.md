# Event Logging System - Security Guidelines

## Overview

The Event Logging System handles sensitive user activity data. This document outlines security requirements, PII handling, and access control.

## Sensitivity Levels

Events are classified into three sensitivity levels:

### Low Sensitivity

- System events (health checks, startup)
- Aggregated statistics
- Non-identifying metadata

**Handling**: Standard logging, no special restrictions.

### Medium Sensitivity

- File operations (paths may reveal information)
- Calendar events (timing information)
- Conference participation

**Handling**: Access logging, limited retention.

### High Sensitivity

- Email metadata (subject hashes, thread IDs)
- Chat interactions
- User behavior patterns

**Handling**: Strict access control, redaction required, audit logging.

## PII Field Classification

### Identifier Fields

These fields contain user identifiers:

| Field      | Classification | Handling                    |
|------------|----------------|------------------------------|
| user_id    | PII Identifier | Required for operation       |
| actor_id   | PII Identifier | May be null                  |
| tenant_id  | Identifier     | Required for multi-tenancy   |

### Potentially Sensitive Fields

These fields may contain sensitive information:

| Field             | Risk                          | Mitigation                   |
|-------------------|-------------------------------|------------------------------|
| object.object_ref | May contain file paths/URLs   | Validate format, no PII      |
| context.thread_id | Links to communication        | Use opaque IDs               |
| correlation_id    | Links user activities         | Time-limited retention       |

### Review Required Fields

These fields require manual review:

| Field      | Risk                          | Mitigation                   |
|------------|-------------------------------|------------------------------|
| metadata.* | Arbitrary key-value data      | Size limits, no raw content  |
| payload.*  | Source-specific data          | Must pass redaction policy   |

## Redaction Policies

### Mail Events

**Prohibited in payload**:
- Email addresses (sender, recipients)
- Raw subject lines
- Email body content
- Attachment names

**Allowed**:
- Thread ID (hashed)
- Subject hash (for dedup)
- Word count (approximate)
- Attachment count

### Chat Events

**Prohibited in payload**:
- Message content
- User names (use IDs)
- Channel names (use IDs)

**Allowed**:
- Channel ID
- Message ID
- Reaction types
- Word count (approximate)

### Calendar Events

**Prohibited in payload**:
- Meeting titles
- Attendee names/emails
- Meeting descriptions

**Allowed**:
- Meeting ID
- Start/end timestamps
- Duration
- Attendee count

## Access Control

### API Access

Events API requires authentication:

```typescript
@UseGuards(ApiKeyGuard)
@Controller('events')
export class EventsController { ... }
```

### Query Access

State queries are scoped by user:

```bash
# Users can only query their own state
GET /events/signals/:userId  # Requires auth as userId
```

### Admin Access

Admin endpoints require elevated privileges:

```bash
GET /events/health      # Admin only
GET /events/dlq/stats   # Admin only
```

## Data Retention

### Event Streams

| Data Type     | Retention       | Reason                       |
|---------------|-----------------|------------------------------|
| Event streams | MAXLEN 100,000  | Memory constraints           |
| DLQ entries   | MAXLEN 10,000   | Error investigation          |
| Dedup keys    | 24 hours TTL    | Prevent duplicate processing |

### Derived State

| State Type       | Retention     | Reason                       |
|------------------|---------------|------------------------------|
| Last seen        | Indefinite    | User activity tracking       |
| Counts (1h)      | 1 hour TTL    | Recent activity window       |
| Counts (24h)     | 24 hour TTL   | Daily activity window        |
| Signals          | 5 minute TTL  | Cached computation           |
| Correlations     | 1 hour TTL    | Cross-source detection       |

## Audit Logging

### What We Log

- All event ingestion attempts (success/failure)
- State query access
- DLQ access
- Configuration changes

### Log Format

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "action": "event.ingest",
  "user_id": "user-123",
  "source": "files",
  "event_type": "file.created",
  "success": true,
  "correlation_id": "corr-abc123"
}
```

### What We Don't Log

- Full event payloads
- PII in log messages
- Derived state values

## Threat Model

### Considered Threats

1. **Unauthorized event injection**
   - Mitigation: API key authentication
   - Mitigation: Input validation

2. **Data exfiltration via events**
   - Mitigation: Payload size limits
   - Mitigation: Redaction policies

3. **Correlation attacks**
   - Mitigation: Time-limited correlation retention
   - Mitigation: Access scoping

4. **DoS via event flood**
   - Mitigation: Rate limiting (configurable)
   - Mitigation: Stream MAXLEN

5. **Replay attacks**
   - Mitigation: Deduplication
   - Mitigation: Event ID validation

## Security Checklist

### Before Deploying

- [ ] API keys configured
- [ ] Redis authentication enabled
- [ ] TLS for Redis connection
- [ ] Rate limiting configured
- [ ] Audit logging enabled

### Periodic Review

- [ ] Review DLQ for sensitive data
- [ ] Check stream lengths
- [ ] Verify retention policies
- [ ] Audit API access logs

## Reporting Security Issues

Report security vulnerabilities to the security team. Do not create public issues for security problems.

## Compliance Notes

### GDPR Considerations

- Events contain user_id (pseudonymous identifier)
- Right to erasure requires stream cleanup capability
- Data portability: events can be exported per user

### Data Minimization

- Only collect necessary event data
- Use hashes instead of raw content
- Implement appropriate retention

## Implementation References

### Validation

```typescript
// packages/events/src/validation.ts
const EventSchema = z.object({
  // Strict validation for all fields
});
```

### Redaction

```typescript
// Metadata size limits
const METADATA_LIMITS = {
  MAX_PROPERTIES: 50,
  MAX_STRING_LENGTH: 1000,
};

// Payload limits
const PAYLOAD_LIMITS = {
  MAX_PROPERTIES: 20,
};
```

### Access Control

```typescript
// apps/api/src/events/guards/api-key.guard.ts
export class ApiKeyGuard implements CanActivate {
  // Validates API key or bearer token
}
```
