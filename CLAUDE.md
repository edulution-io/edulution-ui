@AGENTS.md
# Event Logging System – Project Context

## Role & Goal

You are implementing a production-grade, thesis-worthy Event Logging System for a modular API platform. The result is a working system with clean architecture, tests, observability, security, and documentation.

## Project Constraints

### Must Do
- Read existing repo structure first – adapt to existing patterns
- Extend existing packages where possible
- Small, clean increments – no big rewrites
- Code and docs in English, comments sparse

### Must Not Build
- No full recommendation engine with LLM – only candidate interface
- No full identity resolution – only minimal correlation heuristics
- No raw mail/chat content storage – only redacted metadata

## Data Sources & Demo Data

| Source      | Real Events | Demo Data Allowed |
|-------------|-------------|-------------------|
| Files       | ✅ Yes      | ❌ No             |
| Conferences | ✅ Yes      | ⚠️ Only timestamps for aggregation testing |
| Mail        | ❌ No       | ✅ Yes            |
| CalDAV      | ❌ No       | ✅ Yes (simulated)|
| Chat        | ❌ No       | ✅ Yes            |

## Technical Stack

- **Redis Streams** for event log
- **Consumer Groups** for workers
- **No LLM** in critical decision paths
- Focus: Logging, Aggregation, Candidate Generation interfaces

## Canonical Event Schema

```json
{
  "event_id": "uuid",
  "schema_version": "semver",
  "occurred_at": "iso timestamp",
  "received_at": "iso timestamp",
  "tenant_id": "optional",
  "user_id": "required",
  "source": "files | mail | chat | conferences | <module>",
  "type": "file.moved | mail.received | calendar.event_started | ...",
  "actor_id": "optional",
  "object": {
    "object_type": "string",
    "object_id": "string",
    "object_ref": "optional"
  },
  "context": {
    "context_id": "optional",
    "project_id": "optional",
    "thread_id": "optional",
    "meeting_id": "optional"
  },
  "correlation_id": "string",
  "causation_id": "optional",
  "sensitivity": "low | medium | high",
  "metadata": "object, bounded size",
  "payload": "optional, must pass redaction policy, default empty"
}
```

## Architecture Requirements

### Processing Semantics
- At-least-once delivery + idempotency
- Replay support, ordering strategy, late event handling
- Backpressure, retry with exponential backoff, dead letter queue

### Security & Privacy
- PII field classification
- Redaction rules (no raw mail/chat content)
- Retention policies
- Access control per module

### Observability
- Metrics: ingest rate, processing lag, error rate, DLQ rate
- Traces: correlation across pipeline
- Logs: structured, leveled

## Redis Key Design (Reference)

```
events:stream:{source}          # Main event streams
events:dlq:{source}             # Dead letter queues
events:dedup:{event_id}         # Deduplication keys (TTL)
state:user:{user_id}:lastseen   # Last seen per source
state:user:{user_id}:counts     # Counts per type (1h, 24h)
state:context:{context_id}      # Derived context state
```

## Acceptance Criteria

1. New module can publish events in <30 min without knowing Redis details
2. Pipeline handles 10,000 events locally without issues
3. Idempotency: duplicate events don't change derived state
4. Retry & DLQ: faulty events land in dead letter after N retries
5. Observability: key metrics are visible
6. Privacy: mail/chat payloads are redacted by default

## Deliverables Overview

### A) Architecture & Docs
- System overview with Mermaid diagrams
- Event taxonomy & JSON Schema files
- Redis key design document
- Security & Privacy docs (SECURITY.md)
- 5+ ADRs for key decisions
- README, CONTRIBUTING

### B) Implementation
- Shared event publishing library
- Ingestion layer (Redis Stream writer)
- Aggregation worker (consumer group)
- Query API (signals, state, health)
- Demo data loader CLI
- Integration tests

## Decision Log

When making architectural decisions, document them as ADRs in `/docs/architecture/adr/` with:
- Context
- Decision
- Alternatives considered
- Trade-offs