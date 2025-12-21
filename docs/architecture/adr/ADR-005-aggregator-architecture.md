# ADR-005: Aggregator Architecture

## Status

Accepted

## Context

Raw events need to be processed into derived state for:

- User activity signals (last seen, event counts)
- Communication tracking (pending threads, unread messages)
- Calendar state (upcoming meetings)
- Cross-source correlation detection

Requirements:

- Modular: Easy to add new aggregations
- Efficient: Process events once, update multiple aggregators
- Resilient: Handle failures without data loss
- Queryable: Fast access to derived state

## Decision

We implement a **pluggable aggregator architecture** with:

### Base pattern:

```typescript
interface Aggregator {
  name: string;
  sources: EventSource[]; // Which sources this aggregator handles
  process(event: ProcessedEvent): Promise<void>;
}
```

### Self-registration:

Aggregators register with the worker on module initialization:

```typescript
@Injectable()
class CountsAggregator implements Aggregator, OnModuleInit {
  constructor(private worker: AggregationWorker) {}

  async onModuleInit() {
    this.worker.registerAggregator(this);
  }
}
```

### Processing flow:

```
Event → AggregationWorker → [registered aggregators] → Redis state
```

### Implemented aggregators:

1. **LastSeenAggregator**: Updates `state:user:{id}:lastseen` hash
2. **CountsAggregator**: Increments `state:user:{id}:counts:{window}` hash
3. **CommunicationsAggregator**: Manages awaiting threads set
4. **CalendarAggregator**: Manages upcoming meetings sorted set
5. **CorrelationAggregator**: Detects cross-source patterns

## Alternatives Considered

### 1. Monolithic processor

**Approach**: Single processor handles all aggregation logic

**Pros:**
- Simpler initial implementation
- Single transaction per event

**Cons:**
- Harder to maintain as logic grows
- Cannot selectively enable/disable
- Testing is complex

### 2. Separate consumer groups per aggregator

**Approach**: Each aggregator has its own consumer group

**Pros:**
- Complete isolation
- Independent scaling

**Cons:**
- Event processed N times (once per aggregator)
- Higher Redis load
- Coordination complexity

### 3. Stream processing framework (Flink, Spark)

**Approach**: Use external stream processor

**Pros:**
- Built-in windowing and aggregation
- Horizontal scaling
- State management

**Cons:**
- Major infrastructure addition
- Overkill for current scale
- Operational complexity

### 4. Event-driven with pub/sub

**Approach**: Publish processed events to internal topics

**Pros:**
- Loose coupling
- Easy to add subscribers

**Cons:**
- Additional message passing overhead
- Harder to guarantee ordering
- Complex error handling

## Trade-offs

### Accepted trade-offs:

1. **Sequential processing**: Aggregators process sequentially, not in parallel. Acceptable for current event volume.

2. **Shared state**: All aggregators share Redis connection. Could be bottleneck at scale.

3. **No aggregator-level retry**: If one aggregator fails, entire event fails. Ensures consistency.

### Benefits gained:

1. **Modularity**: Easy to add/remove aggregators
2. **Testability**: Each aggregator tested independently
3. **Single event read**: Event read once from stream, processed by all
4. **Consistent error handling**: Unified retry and DLQ logic

## State Storage Design

### Per-user state:

```
state:user:{user_id}:lastseen    # Hash: source → timestamp
state:user:{user_id}:counts:1h   # Hash: type → count (TTL: 1h)
state:user:{user_id}:counts:24h  # Hash: type → count (TTL: 24h)
state:user:{user_id}:signals     # Hash: computed signals (TTL: 5min)
```

### Communications state:

```
state:communications:{user_id}:awaiting  # Set: thread IDs
state:communications:{user_id}:open      # Sorted set: thread ID → timestamp
```

### Calendar state:

```
state:calendar:{user_id}:upcoming  # Sorted set: meeting ID → start time
```

### Correlation state:

```
state:correlation:{correlation_id}  # Hash: correlation metadata
state:correlation:pending           # Set: active correlation IDs
```

## Error Handling

### Aggregator failure:

1. Exception caught by worker
2. Event not acknowledged
3. Retry with backoff
4. After max retries, move to DLQ

### Partial failure:

If aggregator A succeeds but B fails:
- Event reprocessed
- Aggregator A must be idempotent (it is, by design)
- Eventually consistent

## Implementation

### Worker registration:

```typescript
class AggregationWorker {
  private aggregators: Aggregator[] = [];

  registerAggregator(aggregator: Aggregator) {
    this.aggregators.push(aggregator);
  }

  async processEvent(event: ProcessedEvent) {
    for (const aggregator of this.aggregators) {
      if (aggregator.sources.includes(event.source)) {
        await aggregator.process(event);
      }
    }
  }
}
```

### Aggregator example:

```typescript
class LastSeenAggregator implements Aggregator {
  name = 'last_seen';
  sources = Object.values(EVENT_SOURCES);

  async process(event: ProcessedEvent) {
    const key = buildUserLastSeenKey(event.event.user_id);
    const currentLastSeen = await this.redis.hget(key, event.event.source);

    if (!currentLastSeen || event.event.occurred_at > currentLastSeen) {
      await this.redis.hset(key, event.event.source, event.event.occurred_at);
    }
  }
}
```

## Consequences

1. New aggregators require module registration
2. All aggregators must be idempotent
3. State queries require knowing key patterns
4. TTLs must be set appropriately per aggregator

## References

- [CQRS pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event-driven architecture](https://microservices.io/patterns/data/event-driven-architecture.html)
