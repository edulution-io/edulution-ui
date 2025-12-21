# Event Logging System – Architecture Overview

This document provides a comprehensive overview of the Event Logging System architecture, including component diagrams, data flows, and Redis structures.

## High-Level System Architecture

```mermaid
flowchart TB
    subgraph Sources["Event Sources"]
        FILES[Files Module]
        CONF[Conferences Module]
        MAIL[Mail Module]
        CALDAV[CalDAV Module]
        CHAT[Chat Module]
        HTTP[HTTP Requests]
    end

    subgraph Ingestion["Ingestion Layer"]
        EB[EventBuilder]
        EP[EventPublisher]
        MW[Request Middleware]
    end

    subgraph Redis["Redis Infrastructure"]
        subgraph Streams["Event Streams"]
            S_FILES[events:stream:files]
            S_CONF[events:stream:conferences]
            S_MAIL[events:stream:mail]
            S_CALDAV[events:stream:caldav]
            S_CHAT[events:stream:chat]
        end

        subgraph State["Derived State"]
            LASTSEEN[state:user:*:lastseen]
            COUNTS[state:user:*:counts]
            CONTEXT[state:context:*]
        end

        subgraph Support["Support Structures"]
            DEDUP[events:dedup:*]
            DLQ[events:dlq:*]
        end
    end

    subgraph Workers["Aggregation Workers"]
        CG[Consumer Group]
        AGG[State Aggregators]
        CORR[Correlation Engine]
    end

    subgraph API["Query API"]
        SIGNALS[/signals/:user_id]
        STATE[/state/:context_id]
        HEALTH[/health]
        DLQAPI[/dlq/stats]
    end

    FILES --> EB
    CONF --> EB
    MAIL --> EB
    CALDAV --> EB
    CHAT --> EB
    HTTP --> MW
    MW --> EB

    EB --> EP
    EP --> Streams

    Streams --> CG
    CG --> AGG
    CG --> CORR
    AGG --> State
    CORR --> State

    CG -.->|failures| DLQ
    EP -.->|dedup check| DEDUP

    State --> SIGNALS
    State --> STATE
    Streams --> HEALTH
    DLQ --> DLQAPI
```

## Component Details

### 1. Event Sources

Modules that generate events in the system:

| Source | Event Types | Real Data | Demo Data |
|--------|------------|-----------|-----------|
| Files | file.created, file.moved, file.deleted | Yes | No |
| Conferences | conference.started, conference.ended | Yes | Timestamps only |
| Mail | mail.received, mail.sent, mail.replied | No | Yes |
| CalDAV | calendar.event_created, calendar.event_started | No | Yes |
| Chat | chat.message_sent, chat.message_received | No | Yes |
| HTTP | request.started, request.completed | Yes | No |

### 2. Ingestion Layer

```mermaid
flowchart LR
    subgraph EventBuilder
        VALIDATE[Schema Validation]
        ENRICH[Auto-enrich<br/>event_id, received_at]
        CHAIN[Correlation Chaining]
    end

    subgraph EventPublisher
        DEDUP_CHECK[Deduplication Check]
        STREAM_SELECT[Stream Selection]
        XADD[Redis XADD]
    end

    EVENT[Raw Event] --> VALIDATE
    VALIDATE --> ENRICH
    ENRICH --> CHAIN
    CHAIN --> DEDUP_CHECK
    DEDUP_CHECK --> STREAM_SELECT
    STREAM_SELECT --> XADD
    XADD --> STREAM[(Redis Stream)]
```

**Components:**

- **EventBuilder**: Constructs events conforming to the canonical schema
  - Auto-generates `event_id` (UUID v4)
  - Sets `received_at` timestamp
  - Validates against JSON Schema
  - Supports correlation_id chaining

- **EventPublisher**: Writes events to Redis Streams
  - Checks deduplication keys before writing
  - Routes to appropriate stream by source
  - Handles connection errors gracefully

- **Request Middleware**: Instruments HTTP requests
  - Generates `request.started` and `request.completed` events
  - Attaches `correlation_id` to request context
  - Captures timing, status, and error information

### 3. Redis Streams Architecture

```mermaid
flowchart TB
    subgraph Producer["Event Publishers"]
        P1[Files Publisher]
        P2[Mail Publisher]
        P3[Chat Publisher]
    end

    subgraph Streams["Redis Streams"]
        S1["events:stream:files<br/>━━━━━━━━━━━━━━━<br/>1234-0: {event}<br/>1234-1: {event}<br/>1235-0: {event}"]
        S2["events:stream:mail<br/>━━━━━━━━━━━━━━━<br/>1234-0: {event}<br/>1235-0: {event}"]
        S3["events:stream:chat<br/>━━━━━━━━━━━━━━━<br/>1234-0: {event}"]
    end

    subgraph ConsumerGroup["Consumer Group: aggregators"]
        C1[Worker 1<br/>consumer-1]
        C2[Worker 2<br/>consumer-2]
        C3[Worker 3<br/>consumer-3]
    end

    P1 --> S1
    P2 --> S2
    P3 --> S3

    S1 --> C1
    S1 --> C2
    S2 --> C2
    S2 --> C3
    S3 --> C1
    S3 --> C3
```

**Stream Processing Semantics:**

- **At-least-once delivery**: Events may be delivered multiple times
- **Idempotency**: Deduplication via `event_id` ensures safe reprocessing
- **Ordering**: Per-stream ordering guaranteed; cross-stream ordering via timestamps
- **Backpressure**: Consumer groups provide natural backpressure

### 4. Aggregation Workers

```mermaid
flowchart TB
    subgraph Worker["Base Worker"]
        READ[XREADGROUP]
        DEDUP[Dedup Check]
        PROCESS[Process Event]
        ACK[XACK]
        RETRY[Retry Logic]
        DLQ_MOVE[Move to DLQ]
    end

    subgraph Aggregators["State Aggregators"]
        LAST[LastSeen Aggregator]
        COUNT[Counts Aggregator]
        COMM[Communications Aggregator]
        CAL[Calendar Aggregator]
    end

    subgraph Correlation["Correlation Engine"]
        DETECT[Overlap Detection]
        SIGNAL[Signal Generation]
    end

    STREAM[(Stream)] --> READ
    READ --> DEDUP
    DEDUP -->|new| PROCESS
    DEDUP -->|duplicate| ACK

    PROCESS --> LAST
    PROCESS --> COUNT
    PROCESS --> COMM
    PROCESS --> CAL
    PROCESS --> DETECT

    LAST --> ACK
    COUNT --> ACK
    COMM --> ACK
    CAL --> ACK
    DETECT --> SIGNAL
    SIGNAL --> ACK

    PROCESS -->|error| RETRY
    RETRY -->|max retries| DLQ_MOVE
    RETRY -->|retry| PROCESS
```

**Aggregator Types:**

1. **LastSeen Aggregator**: Tracks last activity per user per source
2. **Counts Aggregator**: Maintains event counts (1h, 24h windows)
3. **Communications Aggregator**: Tracks open mail threads awaiting reply
4. **Calendar Aggregator**: Tracks upcoming conferences by timestamp window
5. **Correlation Engine**: Detects overlapping activity patterns

### 5. Query API

```mermaid
flowchart LR
    subgraph Endpoints["API Endpoints"]
        E1["GET /events/signals/:user_id"]
        E2["GET /events/state/:context_id"]
        E3["GET /events/health"]
        E4["GET /events/dlq/stats"]
    end

    subgraph Data["Data Sources"]
        COUNTS[(Counts Hash)]
        LASTSEEN[(LastSeen Hash)]
        CONTEXT[(Context State)]
        STREAMS[(Event Streams)]
        DLQ[(Dead Letter Queue)]
    end

    E1 --> COUNTS
    E1 --> LASTSEEN
    E2 --> CONTEXT
    E3 --> STREAMS
    E4 --> DLQ
```

**Endpoints:**

| Endpoint | Description | Data Source |
|----------|-------------|-------------|
| GET /events/signals/:user_id | User activity signals | counts, lastseen |
| GET /events/state/:context_id | Context-derived state | context state |
| GET /events/health | Pipeline health metrics | streams info |
| GET /events/dlq/stats | Dead letter queue stats | DLQ streams |

### 6. Error Handling & Recovery

```mermaid
flowchart TB
    subgraph Normal["Normal Flow"]
        E1[Event] --> P1[Process]
        P1 -->|success| A1[ACK]
    end

    subgraph Retry["Retry Flow"]
        E2[Event] --> P2[Process]
        P2 -->|error| R1{Retry Count < 3?}
        R1 -->|yes| DELAY[Exponential Backoff]
        DELAY --> P2
        R1 -->|no| DLQ[Dead Letter Queue]
    end

    subgraph Recovery["Recovery Flow"]
        DLQ --> INSPECT[Manual Inspection]
        INSPECT --> FIX[Fix Issue]
        FIX --> REPLAY[Replay Event]
        REPLAY --> P1
    end
```

**Retry Strategy:**
- Max retries: 3
- Backoff: Exponential (1s, 2s, 4s)
- DLQ retention: 7 days
- Replay support via CLI command

## Data Flow Examples

### Example 1: File Move Operation

```mermaid
sequenceDiagram
    participant User
    participant FilesModule
    participant EventBuilder
    participant EventPublisher
    participant RedisStream
    participant Worker
    participant StateStore

    User->>FilesModule: Move file A to folder B
    FilesModule->>EventBuilder: Build file.moved event
    EventBuilder->>EventBuilder: Generate event_id, validate
    EventBuilder->>EventPublisher: Publish event
    EventPublisher->>RedisStream: XADD events:stream:files

    Worker->>RedisStream: XREADGROUP
    RedisStream->>Worker: file.moved event
    Worker->>Worker: Check dedup (new event)
    Worker->>StateStore: Update user:123:lastseen
    Worker->>StateStore: Increment user:123:counts:1h
    Worker->>RedisStream: XACK
```

### Example 2: Correlation Detection

```mermaid
sequenceDiagram
    participant MailStream
    participant ChatStream
    participant CalendarStream
    participant Worker
    participant CorrelationEngine
    participant ContextState

    Note over Worker: Within 30-minute window

    MailStream->>Worker: mail.received (thread_id: T1)
    Worker->>CorrelationEngine: Check overlaps
    CorrelationEngine->>ContextState: Store pending signal

    ChatStream->>Worker: chat.message_sent (mentions: @john)
    Worker->>CorrelationEngine: Check overlaps
    CorrelationEngine->>ContextState: Update pending signal

    CalendarStream->>Worker: calendar.event_started (meeting with John)
    Worker->>CorrelationEngine: Check overlaps
    CorrelationEngine->>CorrelationEngine: Detect: mail + chat + meeting
    CorrelationEngine->>ContextState: Store correlation signal
```

## Integration with Existing Modules

```mermaid
flowchart TB
    subgraph Existing["Existing NestJS Modules"]
        QUEUE[Queue Module<br/>apps/api/src/queue]
        FS[Filesharing Module]
        CHAT_MOD[Chat Module]
        MAIL_MOD[Mail Module]
        CONF_MOD[Conferences Module]
    end

    subgraph Events["New Events Module"]
        EVENTS_MOD[Events Module<br/>apps/api/src/events]
        EVENTS_LIB[Events Library<br/>libs/src/events]
    end

    subgraph Shared["Shared Infrastructure"]
        REDIS_CONN[Redis Connection<br/>apps/api/src/common]
        EMITTER[EventEmitter2]
        METRICS[Metrics Module]
    end

    QUEUE -.->|pattern reference| EVENTS_MOD
    FS --> EVENTS_MOD
    CHAT_MOD --> EVENTS_MOD
    MAIL_MOD --> EVENTS_MOD
    CONF_MOD --> EVENTS_MOD

    EVENTS_MOD --> REDIS_CONN
    EVENTS_MOD --> EMITTER
    EVENTS_MOD --> METRICS
    EVENTS_LIB --> EVENTS_MOD
```

## Security Boundaries

```mermaid
flowchart TB
    subgraph External["External Boundary"]
        API_GW[API Gateway]
    end

    subgraph Internal["Internal Services"]
        subgraph Trusted["Trusted Zone"]
            EVENTS[Events Module]
            REDIS[(Redis)]
        end

        subgraph Modules["Feature Modules"]
            FILES[Files]
            CHAT[Chat]
            MAIL[Mail]
        end
    end

    API_GW -->|authenticated| Modules
    Modules -->|internal| EVENTS
    EVENTS -->|direct| REDIS

    style External fill:#ff6b6b
    style Trusted fill:#4ecdc4
    style Modules fill:#95e1d3
```

**Security Controls:**
- API key authentication for internal ingestion
- PII field classification and redaction
- No raw mail/chat content in events
- Tenant isolation via `tenant_id`
- Access control per module

## Next Steps

1. **Redis Key Design**: See [redis-design.md](./redis-design.md)
2. **Event Schema**: See [../packages/events/schema/event.schema.json](../../packages/events/schema/event.schema.json)
3. **ADRs**: See [adr/](./adr/) for architectural decisions