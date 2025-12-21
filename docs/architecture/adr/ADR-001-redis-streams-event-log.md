# ADR-001: Redis Streams for Event Log

## Status

Accepted

## Context

The Event Logging System requires a durable, ordered, and efficient mechanism for ingesting, storing, and processing events from multiple sources (files, mail, chat, conferences, calendar). The system must support:

- High-throughput event ingestion (target: 10,000+ events locally)
- Ordered event delivery
- Multiple consumers processing the same stream
- Replay capabilities for reprocessing
- Low latency for real-time aggregation

The existing infrastructure already uses Redis for caching and queue management.

## Decision

We chose **Redis Streams** as the primary event log storage and delivery mechanism.

### Key features used:

1. **XADD** - Append events to streams with auto-generated IDs
2. **XREADGROUP** - Consumer group reads with acknowledgment
3. **XACK** - Acknowledge processed messages
4. **XCLAIM** - Handle stuck/failed consumers
5. **Stream trimming** - Automatic retention management

### Stream structure:

```
events:stream:{source}  # One stream per event source
events:dlq:{source}     # Dead letter queue per source
```

## Alternatives Considered

### 1. Apache Kafka

**Pros:**
- Industry standard for event streaming
- Excellent durability and replication
- Mature ecosystem

**Cons:**
- Requires additional infrastructure (ZooKeeper/KRaft)
- Higher operational complexity
- Overkill for local deployment scale

### 2. PostgreSQL with LISTEN/NOTIFY

**Pros:**
- Already available in stack
- ACID transactions
- Rich querying

**Cons:**
- Not designed for high-throughput streaming
- Limited consumer group semantics
- Would require custom replay logic

### 3. RabbitMQ

**Pros:**
- Mature message broker
- Good consumer group support
- Dead letter handling

**Cons:**
- Additional infrastructure
- Messages not naturally retained for replay
- Would need streams plugin for ordered delivery

### 4. In-memory with file persistence

**Pros:**
- Simple implementation
- No dependencies

**Cons:**
- Limited scalability
- Complex replay implementation
- No built-in consumer groups

## Trade-offs

### Accepted trade-offs:

1. **Single-node limitation**: Redis Streams on a single node limits throughput. Acceptable for current scale; can add Redis Cluster if needed.

2. **Memory constraints**: All events in memory. Mitigated by stream trimming (MAXLEN) and TTLs.

3. **No built-in exactly-once semantics**: Requires application-level deduplication. See ADR-003.

4. **Limited query capabilities**: Cannot query events by arbitrary fields. Addressed by separate aggregated state storage.

### Benefits gained:

1. **Operational simplicity**: Leverages existing Redis infrastructure
2. **Low latency**: Sub-millisecond append and read operations
3. **Native consumer groups**: Built-in support for multiple consumers with acknowledgment
4. **Replay support**: Stream IDs enable efficient replay from any position
5. **Backpressure**: BLOCK parameter allows efficient polling

## Consequences

1. Events module depends on Redis availability
2. Event retention is bounded by memory and MAXLEN configuration
3. Cross-datacenter replication requires Redis Enterprise or custom solutions
4. Monitoring Redis stream length and consumer lag is essential

## References

- [Redis Streams Documentation](https://redis.io/docs/data-types/streams/)
- [Redis Streams Tutorial](https://redis.io/docs/data-types/streams-tutorial/)
