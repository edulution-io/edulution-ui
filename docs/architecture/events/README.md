# Event Logging System

A production-grade event logging and aggregation system for tracking user activity across multiple sources.

## Overview

The Event Logging System provides:

- **Event Ingestion**: High-throughput event collection via REST API
- **Stream Processing**: Redis Streams-based durable event log
- **Aggregation**: Real-time derived state computation
- **Query API**: Fast access to user signals and state

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Sources    │     │   Ingestion  │     │    Redis     │
│  (Files,     │────▶│    Layer     │────▶│   Streams    │
│  Mail, etc)  │     │              │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                     ┌───────────────────────────┘
                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Query API   │◀────│  Aggregation │◀────│   Consumer   │
│              │     │   Workers    │     │    Groups    │
└──────────────┘     └──────────────┘     └──────────────┘
```

## Quick Start

### 1. Prerequisites

- Redis 7.0+ running locally or via Docker
- Node.js 18+

### 2. Start Redis

```bash
docker compose up -d redis
```

### 3. Use the Events API

```typescript
import { EventBuilder, EVENT_SOURCES, FILE_EVENT_TYPES } from '@edulution/events';

// Build an event
const event = EventBuilder.create()
  .withUserId('user-123')
  .withSource(EVENT_SOURCES.FILES)
  .withType(FILE_EVENT_TYPES.CREATED)
  .withObject({
    object_type: 'file',
    object_id: 'file-456',
    object_ref: '/docs/report.pdf',
  })
  .addMetadata('file_size', 1024)
  .build();
```

## Event Sources

| Source      | Description                    | Event Types                      |
|-------------|--------------------------------|----------------------------------|
| files       | File system operations         | file.created, file.moved, etc.   |
| mail        | Email interactions             | mail.received, mail.sent, etc.   |
| chat        | Chat messages                  | chat.message_sent, etc.          |
| conferences | Video conferences              | conference.started, etc.         |
| caldav      | Calendar events                | calendar.event_created, etc.     |
| bulletin    | Bulletin board posts           | bulletin.created, bulletin.updated, bulletin.deleted |
| surveys     | Survey management & responses  | survey.created, survey.updated, survey.deleted, survey.answer_submitted |
| whiteboard  | Collaborative whiteboard       | whiteboard.session_started, whiteboard.session_ended |
| http        | API requests                   | request.started, etc.            |
| system      | System events                  | system.startup, etc.             |

### Production vs Demo Event Sources

The table below shows which event sources have production integrations (real user actions) vs demo data generators:

| Source | Production | Demo | Notes |
|--------|------------|------|-------|
| **files** | ✅ Yes | ❌ No | Events published via `FilesharingService` on upload, copy, move, delete, share |
| **conferences** | ✅ Yes | ⚠️ Timestamps only | Events published via `ConferencesService` on create, start, stop |
| **chat** | ✅ Yes | ✅ Yes | Production: `ChatService`. Demo: for testing when no real chat activity |
| **mail** | ❌ No | ✅ Yes | Read-only IMAP client, no write operations to hook into |
| **caldav** | ❌ No | ✅ Yes | No CalDAV module implemented yet |
| **bulletin** | ✅ Yes | ✅ Yes | Events published via `BulletinBoardService` on create, update, delete |
| **surveys** | ✅ Yes | ✅ Yes | Events published via `SurveysService` and `SurveyAnswersService` |
| **whiteboard** | ✅ Yes | ✅ Yes | Events published via `TLDrawSyncGateway` on session start/end |

**Production Integration Details:**

- **FilesharingService** (`apps/api/src/filesharing/filesharing.service.ts`):
  - `uploadFileViaWebDav()` → `file.uploaded`
  - `copyFileOrFolder()` → `file.copied`
  - `moveOrRenameResources()` → `file.moved`
  - `deleteFileAtPath()` → `file.deleted`
  - `createPublicShare()` → `file.shared`

- **ConferencesService** (`apps/api/src/conferences/conferences.service.ts`):
  - `create()` → `conference.created`
  - `startConference()` → `conference.started`
  - `stopConference()` → `conference.ended`

- **ChatService** (`apps/api/src/chat/chat.service.ts`):
  - `createAIChat()` → `chat.channel_created`
  - `findOrCreateUserChat()` → `chat.channel_created` (on new)
  - `findOrCreateGroupChat()` → `chat.channel_created` (on new)
  - `addMessage()` → `chat.message_sent`

- **BulletinBoardService** (`apps/api/src/bulletinboard/bulletinboard.service.ts`):
  - `createBulletin()` → `bulletin.created`
  - `updateBulletin()` → `bulletin.updated`
  - `removeBulletins()` → `bulletin.deleted`

- **SurveysService** (`apps/api/src/surveys/surveys.service.ts`):
  - `updateOrCreateSurvey()` → `survey.created` (on new) or `survey.updated` (on existing)
  - `deleteSurveys()` → `survey.deleted`

- **SurveyAnswersService** (`apps/api/src/surveys/survey-answers.service.ts`):
  - `addAnswer()` → `survey.answer_submitted`

- **TLDrawSyncGateway** (`apps/api/src/tldraw-sync/tldraw-sync.gateway.ts`):
  - `handleConnection()` → `whiteboard.session_started` (on successful WebSocket connection)
  - WebSocket close event → `whiteboard.session_ended`

**Event Factories:**

All production integrations use shared event factories from `apps/api/src/events/event-factories.ts` to ensure consistent event structure between production and demo data.

**Distinguishing Demo Data:**

Demo events include provenance metadata:
- `metadata._data_source = "demo"` - Indicates the event is synthetic
- `metadata._scenario_id` - Links to a specific test scenario (if applicable)

Query for production events only:
```redis
# Production events have no _data_source field or _data_source != "demo"
```

## API Endpoints

### Event Ingestion

```bash
# Ingest single event
POST /events/ingest
Content-Type: application/json

{
  "event": {
    "user_id": "user-123",
    "source": "files",
    "type": "file.created",
    "object": {
      "object_type": "file",
      "object_id": "file-456"
    }
  }
}

# Ingest with idempotency key (recommended for retry safety)
POST /events/ingest
Content-Type: application/json

{
  "idempotency_key": "client-unique-id-123",
  "event": {
    "user_id": "user-123",
    "source": "files",
    "type": "file.created",
    "object": {
      "object_type": "file",
      "object_id": "file-456"
    }
  }
}

# Ingest multiple events
POST /events/ingest/batch
Content-Type: application/json

{
  "events": [...]
}
```

### Idempotency

The ingestion endpoint supports client-provided idempotency keys for safe retries:

| Field | Type | Description |
|-------|------|-------------|
| `idempotency_key` | string (optional) | Client-provided unique identifier for deduplication |

**Behavior:**
- If `idempotency_key` is provided and seen before, returns `deduplicated: true` with the original `event_id`
- If `idempotency_key` is new, processes the event normally
- If `idempotency_key` is not provided, falls back to event_id-based deduplication (less useful for retries)

**Example Response (first request):**
```json
{
  "success": true,
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "stream_id": "1705312800000-0",
  "deduplicated": false
}
```

**Example Response (duplicate request with same idempotency_key):**
```json
{
  "success": true,
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "stream_id": null,
  "deduplicated": true
}
```

**Redis Key:** `events:idem:{idempotency_key}` with 24-hour TTL

### Query API

```bash
# Get user signals
GET /events/signals/:userId

# Get user state
GET /events/state/:userId

# Get correlation info
GET /events/correlations/:correlationId

# Get pending communications
GET /events/communications/:userId

# Get upcoming calendar events
GET /events/calendar/:userId

# Health check
GET /events/health

# DLQ statistics
GET /events/dlq/stats
```

### Daily Summary API

```bash
# Get user's daily summary for a specific date
GET /summaries/:userId/:date

# Example
GET /summaries/user-123/2024-01-15
```

**Response:**

```json
{
  "user_id": "user-123",
  "date": "2024-01-15",
  "activity_level": "medium",
  "total_events": 35,
  "by_source": [
    { "source": "files", "event_count": 15, "last_activity": "2024-01-15T14:30:00Z" },
    { "source": "mail", "event_count": 20, "last_activity": "2024-01-15T15:00:00Z" }
  ],
  "communications": {
    "threads_active": 5,
    "threads_awaiting_reply": 2,
    "messages_sent": 8,
    "messages_received": 12
  },
  "meetings": {
    "total_scheduled": 3,
    "upcoming_24h": 2,
    "meetings": [
      { "meeting_id": "meeting-abc", "scheduled_at": "2024-01-15T16:00:00Z" }
    ]
  },
  "top_event_types": [
    { "type": "mail.received", "count": 12 },
    { "type": "file.created", "count": 10 }
  ],
  "generated_at": "2024-01-15T15:30:00Z"
}
```

**Features:**
- Date format: YYYY-MM-DD
- Cached for 1 hour per user/date
- Aggregates data from EventsQueryService
- No raw mail/chat content (only counts and metadata)

## Event Schema

```typescript
interface Event {
  // Required fields
  event_id: string;          // UUID v4
  schema_version: string;    // "1.0.0"
  occurred_at: string;       // ISO 8601 timestamp
  received_at: string;       // ISO 8601 timestamp
  user_id: string;           // User identifier
  source: EventSource;       // Event source
  type: string;              // "domain.action" format
  object: EventObject;       // Event subject
  correlation_id: string;    // For tracing
  sensitivity: Sensitivity;  // low | medium | high

  // Optional fields
  tenant_id?: string;
  actor_id?: string;
  context?: EventContext;
  causation_id?: string;
  metadata?: Record<string, string | number | boolean>;
  payload?: Record<string, unknown>;
}
```

## Configuration

### Environment Variables

```bash
# Redis connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Stream configuration
EVENTS_STREAM_MAX_LENGTH=100000
EVENTS_DLQ_MAX_LENGTH=10000
EVENTS_READ_BATCH_SIZE=100
EVENTS_BLOCK_MS=5000

# Retry configuration
EVENTS_MAX_RETRIES=3
EVENTS_INITIAL_DELAY_MS=1000
EVENTS_MAX_DELAY_MS=30000

# TTL configuration
EVENTS_DEDUP_TTL_SECONDS=86400
EVENTS_COUNTS_1H_TTL_SECONDS=3600
```

## Aggregators

The system includes five built-in aggregators:

### 1. LastSeen Aggregator

Tracks last activity timestamp per user and source.

```
Key: state:user:{userId}:lastseen
Type: Hash
Fields: source → timestamp
```

### 2. Counts Aggregator

Counts events by type within time windows.

```
Key: state:user:{userId}:counts:1h
Key: state:user:{userId}:counts:24h
Type: Hash
Fields: eventType → count
```

### 3. Communications Aggregator

Tracks pending communication threads.

```
Key: state:communications:{userId}:awaiting
Type: Set
Members: thread IDs
```

### 4. Calendar Aggregator

Tracks upcoming calendar events.

```
Key: state:calendar:{userId}:upcoming
Type: Sorted Set
Members: meeting IDs (score: start timestamp)
```

### 5. Correlation Aggregator

Detects cross-source activity patterns.

```
Key: state:correlation:{correlationId}
Type: Hash
Fields: correlation metadata
```

## Demo Data

Load demo data for testing:

```bash
npx tsx apps/api/src/events/cli/load-demo-data.ts
```

Options:
- `--host <host>`: Redis host (default: localhost)
- `--port <port>`: Redis port (default: 6379)
- `--users <users>`: Comma-separated user IDs (default: demo-user-1,demo-user-2,demo-user-3)
- `--threads <count>`: Number of mail threads (default: 5)
- `--channels <count>`: Number of chat channels (default: 3)
- `--calendar-events <n>`: Calendar events per user (default: 5)
- `--files <count>`: File operations per user (default: 5)
- `--time-range <hours>`: Time range in hours (default: 48)
- `--no-scenarios`: Disable coherent test scenarios
- `--dry-run`: Generate but don't publish events
- `--verbose, -v`: Show detailed output

### Data Provenance

All demo events include provenance metadata for easy identification:

| Field | Description |
|-------|-------------|
| `_data_source` | Always `"demo"` for generated events |
| `_scenario_id` | Scenario identifier (e.g., `SC-EMAIL-AWAIT-abc123`) if part of a coherent scenario |

This allows filtering demo events from production data and tracing events back to their test scenario.

### Coherent Test Scenarios

The demo data generator includes predefined scenarios that simulate realistic user workflows:

| Scenario Type | Description | Expected Recommendation Class |
|---------------|-------------|-------------------------------|
| `email-thread-awaiting-reply` | Email thread with pending response | `communication` |
| `meeting-preparation` | Upcoming meeting with agenda and prep notes | `meeting` |
| `chat-discussion-action` | Chat discussion leading to file sharing | `focus` |

See [Scenarios Documentation](/docs/evaluation/scenarios/README.md) for detailed scenario specifications.

## Testing

```bash
# Run unit tests
npm run test:api -- --testPathPattern="events/test"

# Run with coverage
npm run test:api -- --testPathPattern="events/test" --coverage
```

## Monitoring

Key metrics to monitor:

- **Stream length**: `XLEN events:stream:{source}`
- **Pending messages**: `XPENDING events:stream:{source} aggregators`
- **Consumer lag**: Time since last processed message
- **DLQ length**: `XLEN events:dlq:{source}`
- **Dedup hit rate**: Percentage of deduplicated events

## Architecture Decision Records

See `/docs/architecture/adr/` for detailed architectural decisions:

- ADR-001: Redis Streams for Event Log
- ADR-002: Consumer Groups for Processing
- ADR-003: Deduplication Strategy
- ADR-004: Event Schema Design
- ADR-005: Aggregator Architecture

## Recommendations API

The Recommendations module provides a deterministic (non-LLM) system for storing and retrieving recommendation candidates.

### Overview

- **Outbox per user**: Each user has a sorted set of recommendation candidates ranked by score
- **Candidate storage**: Full candidate data stored with 7-day TTL
- **Deterministic ordering**: Score DESC, created_at ASC, candidate_id ASC
- **Privacy-preserving**: Only metadata/evidence references stored, no raw content

### Endpoints

```bash
# List recommendations for user
GET /recommendations/:userId
GET /recommendations/:userId?limit=20

# Get specific candidate
GET /recommendations/:userId/:candidateId
```

### Response: List

```json
[
  {
    "candidate_id": "550e8400-e29b-41d4-a716-446655440000",
    "score": 0.85,
    "created_at": "2024-01-15T10:00:00.000Z",
    "class": "communication",
    "title": "Follow up on pending thread",
    "rationale": "Thread has been awaiting response for 3 days",
    "context_id": "thread-abc123"
  }
]
```

### Response: Single Candidate

```json
{
  "candidate_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-123",
  "created_at": "2024-01-15T10:00:00.000Z",
  "class": "communication",
  "title": "Follow up on pending thread",
  "rationale": "Thread has been awaiting response for 3 days",
  "evidence": [
    { "kind": "mail_thread", "ref": "thread-abc123" },
    { "kind": "calendar_event", "ref": "meeting-xyz" }
  ],
  "scores": {
    "confidence": 0.9,
    "impact": 0.8,
    "effort": 0.2
  },
  "context_id": "thread-abc123"
}
```

### Recommendation Classes

| Class          | Description                        |
|----------------|------------------------------------|
| communication  | Follow-up on emails/threads        |
| planning       | Task or project planning actions   |
| cleanup        | Organization or cleanup tasks      |
| focus          | Deep work or focus time            |
| meeting        | Meeting preparation or follow-up   |

### Redis Key Design

```
reco:outbox:user:{userId}       # Sorted set: candidate_id → score
reco:candidate:{candidateId}    # String: JSON candidate data
```

Both keys use 7-day TTL.

### Usage from Code

```typescript
import { RecommendationsService } from '../recommendations';
import type { RecommendationCandidate } from '@edulution/events';

// Store a candidate
const candidate: RecommendationCandidate = {
  candidate_id: uuidv4(),
  user_id: 'user-123',
  created_at: new Date().toISOString(),
  class: 'communication',
  title: 'Follow up on thread',
  rationale: 'Awaiting response for 3 days',
  evidence: [{ kind: 'mail_thread', ref: 'thread-abc' }],
  scores: { confidence: 0.9, impact: 0.8, effort: 0.2 },
};

await recommendationsService.putCandidate(candidate, 0.85);

// List recommendations
const items = await recommendationsService.list('user-123', 10);

// Get single candidate
const full = await recommendationsService.getCandidate(candidate.candidate_id);
```

### Schema Validation

All candidates are validated with Zod schemas from `@edulution/events`:

```typescript
import {
  RecommendationCandidateSchema,
  RecommendationOutboxItemSchema,
  validateRecommendationCandidate,
} from '@edulution/events';

// Validate before storage
const result = validateRecommendationCandidate(candidate);
if (!result.success) {
  console.error(result.error);
}
```

## Rule Engine

The Rule Engine generates recommendation candidates based on user state data from EventsQueryService.

### Overview

- **Deterministic**: No LLM, purely rule-based scoring
- **Extensible**: Add new rules by extending BaseRule
- **Configurable**: Rules can be enabled/disabled and have custom thresholds
- **Priority-based**: Higher priority rules are evaluated first

### Endpoints

```bash
# List all registered rules
GET /recommendations/rules

# Generate recommendations for user
POST /recommendations/:userId/generate
```

### Response: Rules List

```json
{
  "count": 13,
  "rules": [
    {
      "id": "calendar:meeting-prep",
      "name": "Meeting Preparation",
      "class": "meeting",
      "priority": 90,
      "enabled": true
    }
  ]
}
```

### Response: Generate

```json
{
  "user_id": "user-123",
  "candidates_generated": 3,
  "rules_evaluated": 13,
  "duration_ms": 45
}
```

### Built-in Rules

| Rule ID | Class | Priority | Trigger Condition |
|---------|-------|----------|-------------------|
| `calendar:meeting-prep` | meeting | 90 | Meeting within 2 hours |
| `communication:awaiting-reply` | communication | 80 | Threads awaiting reply |
| `focus:deep-work` | focus | 70 | High activity, no meetings |
| `communication:high-volume` | communication | 60 | 5+ threads awaiting |
| `planning:workload-review` | planning | 55 | 10+ open threads |
| `calendar:busy-day` | meeting | 50 | 3+ meetings scheduled |
| `planning:eod-review` | planning | 45 | 4-6 PM with activity |
| `focus:break-needed` | focus | 40 | 50+ events/hour |
| `cleanup:stale-threads` | cleanup | 40 | Threads inactive 7+ days |
| `planning:weekly` | planning | 35 | Mon AM or Fri PM |
| `focus:low-activity` | focus | 30 | Low activity + pending |
| `cleanup:inbox-zero` | cleanup | 25 | Near inbox zero |
| `cleanup:organize-files` | cleanup | 20 | 20+ file events/day |

### Creating Custom Rules

```typescript
import { BaseRule, RuleContext, RuleResult } from '../recommendations/rules';
import { RECOMMENDATION_CLASSES } from '@edulution/events';

class CustomRule extends BaseRule {
  readonly id = 'custom:my-rule';
  readonly name = 'My Custom Rule';
  readonly class = RECOMMENDATION_CLASSES.PLANNING;
  readonly priority = 50;

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    // Access user state
    const { signals, communications, upcoming_meetings } = context;

    // Check conditions
    if (signals.activity_level !== 'high') {
      return [];
    }

    // Return recommendations
    return [
      this.createResult({
        class: this.class,
        title: 'My recommendation',
        rationale: 'Because of X, Y, Z',
        score: 0.75,
        evidence: [{ kind: 'signal', ref: 'activity-high' }],
        tags: ['custom'],
      }),
    ];
  }
}
```

### Registering Custom Rules

```typescript
import { RuleEngineService } from '../recommendations/rules';

// In your module
ruleEngineService.registerRule(new CustomRule(), {
  enabled: true,
  thresholds: { custom_threshold: 10 },
});
```

### RuleContext Data

The rule engine provides access to:

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | string | User identifier |
| `timestamp` | number | Current timestamp |
| `signals` | UserSignals | Activity level, primary source |
| `last_seen` | UserLastSeen | Last activity per source |
| `counts_1h` | UserCounts | Event counts (1 hour) |
| `counts_24h` | UserCounts | Event counts (24 hours) |
| `communications` | CommunicationsState | Open threads, awaiting reply |
| `upcoming_meetings` | UpcomingMeeting[] | Scheduled meetings |

### Testing Rules

```bash
# Run rule tests
npm run test:api -- --testPathPattern="recommendations/rules/test"
```

## Security

See [SECURITY.md](./SECURITY.md) for:

- PII handling guidelines
- Sensitivity levels
- Redaction policies
- Access control
