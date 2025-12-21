# ADR-003: Deduplication Strategy

## Status

Accepted

## Context

Redis Streams provides at-least-once delivery semantics. Duplicate events can occur due to:

- Publisher retries after timeout (success not received)
- Consumer crashes before XACK
- Network partitions during acknowledgment
- Message reclaim from stuck consumers

Duplicate processing can cause:

- Incorrect counts (double counting)
- Multiple notifications
- Inconsistent derived state
- Data corruption in aggregations

## Decision

We implement **two-layer deduplication**:

### Layer 1: Publisher-side deduplication

Before writing to stream, check if event was already published:

```typescript
const dedupKey = `events:dedup:${event.event_id}`;
const exists = await redis.get(dedupKey);
if (exists) {
  return { success: true, deduplicated: true };
}
// Publish event
await redis.set(dedupKey, '1', 'EX', TTL_CONFIG.DEDUP_TTL_SECONDS);
```

### Layer 2: Consumer-side idempotency

Aggregators use idempotent operations where possible:

- `HSET` for last_seen (overwrites are safe)
- `SADD`/`SREM` for set operations (idempotent)
- Check before increment for counts

### Event ID generation:

Event IDs are UUID v4, generated at ingestion:

```typescript
const eventId = crypto.randomUUID();
```

### TTL strategy:

- Dedup keys expire after 24 hours (configurable)
- Covers typical retry windows
- Balances memory usage vs. protection window

## Alternatives Considered

### 1. Exactly-once semantics in Redis

**Approach**: Use Lua scripts for atomic check-and-publish

**Pros:**
- Stronger guarantees at source

**Cons:**
- Complex Lua scripts
- Still doesn't help consumer-side duplicates
- Performance overhead

### 2. Database-backed deduplication

**Approach**: Store all event IDs in PostgreSQL

**Pros:**
- Persistent dedup state
- Can deduplicate indefinitely

**Cons:**
- Write amplification (every event = DB write)
- Latency increase
- Database load

### 3. Bloom filters

**Approach**: Probabilistic dedup with bloom filters

**Pros:**
- Memory efficient
- Very fast lookups

**Cons:**
- False positives possible (would drop valid events)
- Cannot remove entries
- Complexity in sizing

### 4. Content-based hashing

**Approach**: Generate ID from event content hash

**Pros:**
- Same event always has same ID
- No central coordination

**Cons:**
- Hash collisions possible
- Cannot have intentional duplicate events
- Doesn't help with consumer-side dedup

## Trade-offs

### Accepted trade-offs:

1. **Memory usage**: Each event ID stored for 24 hours (~100 bytes per event)
2. **Window limitation**: Events older than TTL can be duplicated
3. **Not 100% guaranteed**: Network issues can still cause edge cases

### Benefits gained:

1. **Simple implementation**: Just key-value lookups
2. **Low latency**: Redis GET is sub-millisecond
3. **Self-cleaning**: TTL handles cleanup automatically
4. **Transparent**: Deduplication status returned in response

## Implementation

### Dedup key format:

```
events:dedup:{event_id}
```

### Publisher flow:

```typescript
async publish(event: Event): Promise<PublishResult> {
  const dedupKey = buildDedupKey(event.event_id);

  // Check for existing
  const exists = await this.redis.get(dedupKey);
  if (exists) {
    return { success: true, eventId: event.event_id, deduplicated: true };
  }

  // Publish to stream
  const streamId = await this.redis.xadd(streamKey, '*', 'data', JSON.stringify(event));

  // Mark as published
  await this.redis.set(dedupKey, '1', 'EX', TTL_CONFIG.DEDUP_TTL_SECONDS);

  return { success: true, eventId: event.event_id, streamId };
}
```

### Consumer idempotency:

```typescript
// For counts - check current value context
const currentCount = await redis.hget(countsKey, eventType);
// Aggregator decides based on event timestamp vs last processed

// For sets - inherently idempotent
await redis.sadd(awaitingKey, threadId); // No-op if already exists
```

## Consequences

1. Event IDs must be globally unique (UUIDs)
2. Dedup window is configurable but bounded
3. Memory scales with event volume
4. Monitoring should track dedup hit rate

## References

- [Idempotency in distributed systems](https://en.wikipedia.org/wiki/Idempotence)
- [Redis key expiration](https://redis.io/commands/expire/)
