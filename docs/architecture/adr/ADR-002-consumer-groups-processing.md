# ADR-002: Consumer Groups for Event Processing

## Status

Accepted

## Context

Events need to be processed by multiple independent workers for:

- State aggregation (counts, last seen, communications tracking)
- Archival processing
- Future: external notifications, analytics pipelines

Requirements:

- Each event processed exactly once per consumer group
- Parallel processing within a group for throughput
- Fault tolerance: failed consumers shouldn't block progress
- Ability to add new consumer groups without reprocessing

## Decision

We use **Redis Stream Consumer Groups** for coordinated event processing.

### Architecture:

```
Stream: events:stream:files
  ├── Consumer Group: aggregators
  │   ├── Consumer: aggregator-1
  │   └── Consumer: aggregator-2
  └── Consumer Group: archiver (future)
      └── Consumer: archiver-1
```

### Processing flow:

1. Consumer calls XREADGROUP with consumer name
2. Redis delivers unprocessed messages to that consumer
3. Consumer processes event and calls XACK
4. Failed events remain in Pending Entries List (PEL)
5. XCLAIM reclaims stuck messages after timeout

### Consumer naming:

```typescript
const consumerName = `${groupName}-${hostname}-${pid}`;
```

## Alternatives Considered

### 1. Single consumer per stream

**Pros:**
- Simpler implementation
- Guaranteed ordering

**Cons:**
- No horizontal scaling
- Single point of failure
- Cannot process different event types in parallel

### 2. Pub/Sub pattern

**Pros:**
- Real-time delivery
- Simple fan-out

**Cons:**
- No acknowledgment
- No replay for missed messages
- No persistence

### 3. External message queue (SQS, Cloud Pub/Sub)

**Pros:**
- Managed infrastructure
- Built-in retry mechanisms

**Cons:**
- Additional dependency
- Latency overhead
- Cost at scale
- Vendor lock-in

### 4. Database polling

**Pros:**
- Works with existing PostgreSQL
- Simple implementation

**Cons:**
- High database load
- Inefficient polling
- Complex cursor management

## Trade-offs

### Accepted trade-offs:

1. **Partition limitation**: Redis doesn't partition like Kafka. Single stream throughput is bounded. Acceptable for current scale.

2. **No consumer-level filtering**: All consumers in a group receive all messages. Filtering happens in application code.

3. **Manual pending cleanup**: Must implement XCLAIM logic for stuck messages.

### Benefits gained:

1. **At-least-once delivery**: Messages acknowledged only after successful processing
2. **Automatic load balancing**: Redis distributes messages among consumers
3. **Visibility into pending work**: PEL shows unacknowledged messages
4. **Consumer crash recovery**: Messages automatically redistributed

## Implementation Details

### Consumer group creation:

```typescript
await redis.xgroup('CREATE', streamKey, groupName, '0', 'MKSTREAM');
```

### Reading with acknowledgment:

```typescript
const entries = await redis.xreadgroup(
  'GROUP', groupName, consumerName,
  'COUNT', batchSize,
  'BLOCK', blockMs,
  'STREAMS', streamKey, '>'
);
```

### Claiming stuck messages:

```typescript
const pending = await redis.xpending(streamKey, groupName);
if (pending.idleTime > claimThresholdMs) {
  await redis.xclaim(streamKey, groupName, consumerName, claimThresholdMs, messageId);
}
```

## Consequences

1. Must create consumer groups before first read
2. Consumer names must be unique per instance
3. Need monitoring for consumer lag and PEL size
4. Graceful shutdown requires draining in-flight messages

## References

- [Redis Consumer Groups](https://redis.io/docs/data-types/streams-tutorial/#consumer-groups)
- [Managing Consumer Groups](https://redis.io/commands/xgroup/)
