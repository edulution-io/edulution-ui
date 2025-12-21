# Redis Key Design – Event Logging System

This document defines the Redis key structure, data types, and access patterns for the Event Logging System.

## Key Naming Convention

All keys follow a hierarchical namespace pattern:

```
{domain}:{type}:{identifier}[:sub-identifier]
```

- **domain**: Top-level category (events, state, meta)
- **type**: Data structure purpose (stream, hash, set, zset)
- **identifier**: Primary key (source, user_id, context_id)
- **sub-identifier**: Optional secondary key

## 1. Event Streams

### Main Event Streams

Stores raw events partitioned by source for independent scaling.

| Key Pattern | Type | Description |
|-------------|------|-------------|
| `events:stream:files` | Stream | File operation events |
| `events:stream:conferences` | Stream | Conference/meeting events |
| `events:stream:mail` | Stream | Email events |
| `events:stream:caldav` | Stream | Calendar events |
| `events:stream:chat` | Stream | Chat message events |
| `events:stream:http` | Stream | HTTP request events |

**Entry Structure:**
```
XADD events:stream:{source} * \
  event_id {uuid} \
  schema_version {semver} \
  occurred_at {iso_timestamp} \
  received_at {iso_timestamp} \
  tenant_id {string|null} \
  user_id {string} \
  source {string} \
  type {string} \
  actor_id {string|null} \
  object {json} \
  context {json} \
  correlation_id {string} \
  causation_id {string|null} \
  sensitivity {low|medium|high} \
  metadata {json} \
  payload {json}
```

**Example:**
```redis
XADD events:stream:files * \
  event_id "550e8400-e29b-41d4-a716-446655440000" \
  schema_version "1.0.0" \
  occurred_at "2024-01-15T10:30:00.000Z" \
  received_at "2024-01-15T10:30:00.050Z" \
  user_id "user-123" \
  source "files" \
  type "file.moved" \
  object '{"object_type":"file","object_id":"file-456","object_ref":"/docs/report.pdf"}' \
  context '{"context_id":"project-789"}' \
  correlation_id "corr-abc-123" \
  sensitivity "low" \
  metadata '{"old_path":"/inbox/report.pdf","new_path":"/docs/report.pdf"}' \
  payload '{}'
```

**Operations:**
```redis
# Write event
XADD events:stream:files * ...

# Read with consumer group
XREADGROUP GROUP aggregators consumer-1 COUNT 100 BLOCK 5000 STREAMS events:stream:files >

# Acknowledge processed event
XACK events:stream:files aggregators {message_id}

# Get stream info
XINFO STREAM events:stream:files

# Get pending messages
XPENDING events:stream:files aggregators
```

**Retention Policy:**
- MAXLEN ~100000 (approximate trimming for performance)
- Automatic trimming on write: `XADD events:stream:files MAXLEN ~ 100000 * ...`

---

## 2. Consumer Groups

Consumer groups enable distributed processing with at-least-once delivery.

### Group Configuration

| Stream | Group Name | Purpose |
|--------|------------|---------|
| events:stream:* | `aggregators` | Main processing group |
| events:stream:* | `archiver` | Long-term storage (optional) |

**Setup Commands:**
```redis
# Create consumer group (run once per stream)
XGROUP CREATE events:stream:files aggregators $ MKSTREAM
XGROUP CREATE events:stream:conferences aggregators $ MKSTREAM
XGROUP CREATE events:stream:mail aggregators $ MKSTREAM
XGROUP CREATE events:stream:caldav aggregators $ MKSTREAM
XGROUP CREATE events:stream:chat aggregators $ MKSTREAM
XGROUP CREATE events:stream:http aggregators $ MKSTREAM

# Create archiver group (optional)
XGROUP CREATE events:stream:files archiver $ MKSTREAM
```

**Consumer Naming:**
```
{group}-{instance_id}-{worker_index}
Example: aggregators-pod-abc-0
```

**Pending Entry Recovery:**
```redis
# Claim messages pending > 60 seconds
XAUTOCLAIM events:stream:files aggregators consumer-1 60000 0-0 COUNT 100
```

---

## 3. Dead Letter Queues

Failed events after max retries are moved to DLQ for manual inspection.

| Key Pattern | Type | Description |
|-------------|------|-------------|
| `events:dlq:files` | Stream | Failed file events |
| `events:dlq:conferences` | Stream | Failed conference events |
| `events:dlq:mail` | Stream | Failed mail events |
| `events:dlq:caldav` | Stream | Failed calendar events |
| `events:dlq:chat` | Stream | Failed chat events |
| `events:dlq:http` | Stream | Failed HTTP events |

**Entry Structure (extends original event):**
```redis
XADD events:dlq:{source} * \
  original_stream_id {string} \
  original_event_id {string} \
  failure_reason {string} \
  retry_count {number} \
  failed_at {iso_timestamp} \
  # ... original event fields
```

**Operations:**
```redis
# Move to DLQ
XADD events:dlq:files * \
  original_stream_id "1234567890-0" \
  failure_reason "ValidationError: invalid user_id" \
  retry_count 3 \
  failed_at "2024-01-15T10:35:00.000Z" \
  ... # original fields

# List DLQ entries
XRANGE events:dlq:files - + COUNT 100

# Replay from DLQ (manual)
# 1. Read entry: XRANGE events:dlq:files {id} {id}
# 2. Fix and re-publish to main stream
# 3. Delete from DLQ: XDEL events:dlq:files {id}
```

**Retention:**
- MAXLEN ~10000
- TTL-based cleanup via scheduled job (7 days)

---

## 4. Deduplication Keys

Prevents duplicate event processing using event_id as key.

| Key Pattern | Type | TTL | Description |
|-------------|------|-----|-------------|
| `events:dedup:{event_id}` | String | 24h | Dedup marker |

**Operations:**
```redis
# Check and set (atomic)
SET events:dedup:550e8400-e29b-41d4-a716-446655440000 1 NX EX 86400

# Returns:
# - OK: New event, proceed with processing
# - nil: Duplicate, skip processing
```

**Alternative: Bloom Filter (for high volume)**
```redis
# Using RedisBloom module
BF.ADD events:dedup:bloom {event_id}
BF.EXISTS events:dedup:bloom {event_id}
```

---

## 5. User State

Tracks per-user activity metrics and status.

### Last Seen Per Source

| Key Pattern | Type | Description |
|-------------|------|-------------|
| `state:user:{user_id}:lastseen` | Hash | Last activity timestamp per source |

**Structure:**
```redis
HSET state:user:user-123:lastseen \
  files "2024-01-15T10:30:00.000Z" \
  mail "2024-01-15T09:15:00.000Z" \
  chat "2024-01-15T10:28:00.000Z" \
  conferences "2024-01-14T14:00:00.000Z" \
  caldav "2024-01-15T08:00:00.000Z"
```

**Operations:**
```redis
# Update last seen
HSET state:user:user-123:lastseen files "2024-01-15T10:30:00.000Z"

# Get all last seen
HGETALL state:user:user-123:lastseen

# Get specific source
HGET state:user:user-123:lastseen files
```

### Event Counts

| Key Pattern | Type | TTL | Description |
|-------------|------|-----|-------------|
| `state:user:{user_id}:counts:1h` | Hash | 1h | Hourly event counts by type |
| `state:user:{user_id}:counts:24h` | Hash | 24h | Daily event counts by type |

**Structure:**
```redis
HSET state:user:user-123:counts:1h \
  file.created 5 \
  file.moved 2 \
  mail.sent 3 \
  chat.message_sent 15

EXPIRE state:user:user-123:counts:1h 3600
```

**Operations:**
```redis
# Increment count
HINCRBY state:user:user-123:counts:1h file.created 1

# Get all counts
HGETALL state:user:user-123:counts:1h

# Reset with TTL refresh
DEL state:user:user-123:counts:1h
```

### User Signals (Computed)

| Key Pattern | Type | TTL | Description |
|-------------|------|-----|-------------|
| `state:user:{user_id}:signals` | Hash | 5m | Computed activity signals |

**Structure:**
```redis
HSET state:user:user-123:signals \
  activity_level "high" \
  primary_source "files" \
  pending_communications 3 \
  upcoming_meetings 2 \
  last_computed "2024-01-15T10:30:00.000Z"
```

---

## 6. Context State

Tracks state for correlation contexts (projects, threads, meetings).

| Key Pattern | Type | Description |
|-------------|------|-------------|
| `state:context:{context_id}` | Hash | Context-level derived state |
| `state:context:{context_id}:events` | Sorted Set | Recent events for context |

**Context Hash Structure:**
```redis
HSET state:context:project-789 \
  context_type "project" \
  created_at "2024-01-01T00:00:00.000Z" \
  last_activity "2024-01-15T10:30:00.000Z" \
  event_count 150 \
  participant_count 5 \
  status "active"
```

**Context Events (Sorted Set by timestamp):**
```redis
ZADD state:context:project-789:events \
  1705315800000 "event-id-1" \
  1705315900000 "event-id-2" \
  1705316000000 "event-id-3"

# Keep only last 1000 events
ZREMRANGEBYRANK state:context:project-789:events 0 -1001
```

**Operations:**
```redis
# Update context state
HSET state:context:project-789 last_activity "2024-01-15T10:30:00.000Z"
HINCRBY state:context:project-789 event_count 1

# Get context state
HGETALL state:context:project-789

# Get recent events for context
ZREVRANGE state:context:project-789:events 0 49 WITHSCORES
```

---

## 7. Correlation State

Tracks potential correlations between events across sources.

| Key Pattern | Type | TTL | Description |
|-------------|------|-----|-------------|
| `state:correlation:{correlation_id}` | Hash | 1h | Correlation tracking |
| `state:correlation:pending` | Sorted Set | - | Pending correlations by time |

**Correlation Hash Structure:**
```redis
HSET state:correlation:corr-abc-123 \
  created_at "2024-01-15T10:00:00.000Z" \
  sources "files,mail,chat" \
  event_count 5 \
  user_ids "user-123,user-456" \
  context_ids "project-789" \
  signal_type "meeting_preparation" \
  confidence 0.85
```

**Pending Correlations:**
```redis
# Add pending correlation (score = expiry timestamp)
ZADD state:correlation:pending 1705319400000 "corr-abc-123"

# Get expired correlations for finalization
ZRANGEBYSCORE state:correlation:pending -inf {current_timestamp}
```

---

## 8. Communication Tracking

Tracks open communications (mail threads, chat conversations).

| Key Pattern | Type | Description |
|-------------|------|-------------|
| `state:communications:{user_id}:open` | Sorted Set | Open threads by last activity |
| `state:communications:{user_id}:awaiting` | Set | Threads awaiting user reply |

**Structure:**
```redis
# Open threads (score = last activity timestamp)
ZADD state:communications:user-123:open \
  1705315800000 "thread-001" \
  1705315900000 "thread-002"

# Threads awaiting reply
SADD state:communications:user-123:awaiting "thread-001" "thread-003"
```

**Operations:**
```redis
# Mark thread as replied (remove from awaiting)
SREM state:communications:user-123:awaiting "thread-001"

# Get count of awaiting threads
SCARD state:communications:user-123:awaiting

# Get recent open threads
ZREVRANGE state:communications:user-123:open 0 9 WITHSCORES
```

---

## 9. Calendar/Conference Tracking

Tracks upcoming conferences and calendar events.

| Key Pattern | Type | Description |
|-------------|------|-------------|
| `state:calendar:{user_id}:upcoming` | Sorted Set | Upcoming events by start time |
| `state:conferences:active` | Set | Currently active conference IDs |

**Structure:**
```redis
# Upcoming events (score = start timestamp)
ZADD state:calendar:user-123:upcoming \
  1705320000000 "meeting-001" \
  1705323600000 "meeting-002"

# Active conferences
SADD state:conferences:active "conf-001" "conf-002"
```

**Operations:**
```redis
# Get events in next hour
ZRANGEBYSCORE state:calendar:user-123:upcoming {now} {now + 3600000}

# Remove past events
ZREMRANGEBYSCORE state:calendar:user-123:upcoming -inf {now - 3600000}

# Mark conference as active
SADD state:conferences:active "conf-001"

# Mark conference as ended
SREM state:conferences:active "conf-001"
```

---

## 10. Metadata & Configuration

System-level metadata and configuration.

| Key Pattern | Type | Description |
|-------------|------|-------------|
| `meta:schema:version` | String | Current schema version |
| `meta:streams:sources` | Set | Registered source names |
| `meta:consumers:active` | Hash | Active consumer heartbeats |

**Operations:**
```redis
# Schema version
SET meta:schema:version "1.0.0"

# Registered sources
SADD meta:streams:sources files conferences mail caldav chat http

# Consumer heartbeat (TTL for liveness)
HSET meta:consumers:active aggregators-pod-abc-0 "2024-01-15T10:30:00.000Z"
EXPIRE meta:consumers:active 60
```

---

## Key Summary Table

| Key Pattern | Type | TTL | Purpose |
|-------------|------|-----|---------|
| `events:stream:{source}` | Stream | MAXLEN ~100k | Raw event storage |
| `events:dlq:{source}` | Stream | MAXLEN ~10k | Failed events |
| `events:dedup:{event_id}` | String | 24h | Deduplication |
| `state:user:{id}:lastseen` | Hash | - | Last activity per source |
| `state:user:{id}:counts:1h` | Hash | 1h | Hourly event counts |
| `state:user:{id}:counts:24h` | Hash | 24h | Daily event counts |
| `state:user:{id}:signals` | Hash | 5m | Computed signals |
| `state:context:{id}` | Hash | - | Context state |
| `state:context:{id}:events` | ZSet | - | Context event history |
| `state:correlation:{id}` | Hash | 1h | Correlation tracking |
| `state:correlation:pending` | ZSet | - | Pending correlations |
| `state:communications:{id}:open` | ZSet | - | Open threads |
| `state:communications:{id}:awaiting` | Set | - | Awaiting reply |
| `state:calendar:{id}:upcoming` | ZSet | - | Upcoming events |
| `state:conferences:active` | Set | - | Active conferences |
| `meta:schema:version` | String | - | Schema version |
| `meta:streams:sources` | Set | - | Registered sources |
| `meta:consumers:active` | Hash | 60s | Consumer liveness |

---

## Memory Estimation

| Data Type | Estimated Size | Count | Total |
|-----------|---------------|-------|-------|
| Event (stream entry) | ~2 KB | 100,000 | ~200 MB |
| User state (all hashes) | ~1 KB | 10,000 users | ~10 MB |
| Context state | ~500 B | 5,000 contexts | ~2.5 MB |
| Dedup keys | ~100 B | 100,000 | ~10 MB |
| DLQ entries | ~2.5 KB | 10,000 | ~25 MB |
| **Total Estimated** | | | **~250 MB** |

---

## Access Patterns

### Write Patterns

1. **Event Ingestion**: XADD to stream, SET dedup key
2. **State Update**: HSET/HINCRBY to user/context hashes
3. **Correlation**: ZADD to pending, HSET to correlation hash

### Read Patterns

1. **Stream Processing**: XREADGROUP with consumer group
2. **User Signals**: HGETALL on user state hashes
3. **Context Query**: HGETALL + ZREVRANGE for context + events
4. **Health Check**: XINFO STREAM for all streams

### Maintenance Patterns

1. **Stream Trimming**: Automatic via MAXLEN on XADD
2. **Expired Keys**: Redis TTL handles cleanup
3. **Pending Recovery**: XAUTOCLAIM for stuck messages
4. **DLQ Cleanup**: Scheduled job with XRANGE + XDEL

---

## Related Documents

- [System Overview](./system-overview.md)
- [Event Schema](../../packages/events/schema/event.schema.json)
- [ADR-001: Redis Streams vs Kafka](./adr/ADR-001-redis-streams-vs-kafka.md)