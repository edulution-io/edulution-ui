# Explainability System

This document describes the explainability architecture for the recommendation engine, enabling transparent and auditable recommendations.

## Overview

Every recommendation candidate includes structured explainability data that answers the question "Why was this recommended?" The system provides:

- **Traceable Evidence**: Links recommendations to their source data
- **Deterministic Rendering**: Same input always produces same explanation
- **Privacy-Safe**: Excludes sensitive content from explanations
- **Versioned Rules**: Semantic versioning for all recommendation rules

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Rule Engine                                  │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐                  │
│  │ Rule A     │   │ Rule B     │   │ Rule N     │                  │
│  │ evaluate() │   │ evaluate() │   │ evaluate() │                  │
│  └─────┬──────┘   └─────┬──────┘   └─────┬──────┘                  │
│        │                │                │                          │
│        ▼                ▼                ▼                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    createResult()                             │  │
│  │  - Adds explainability with rule_id, rule_version            │  │
│  │  - Includes evidence chain                                    │  │
│  │  - Validates against schema                                   │  │
│  └─────────────────────────┬────────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RecommendationCandidate                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ explainability: {                                              │  │
│  │   rule_id: "reco.comm.awaiting_reply",                        │  │
│  │   rule_version: "1.0.0",                                      │  │
│  │   summary: "Several conversations need attention.",           │  │
│  │   evidence: [                                                  │  │
│  │     { kind: "state", label: "...", refs: [...], meta: {...} } │  │
│  │   ]                                                            │  │
│  │ }                                                              │  │
│  └───────────────────────────────────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        /why Endpoint                                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ WhyService.renderWhy()                                         │  │
│  │  - Deterministic text generation                              │  │
│  │  - No LLM dependency                                          │  │
│  │  - Numbers converted to words                                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Structures

### Explainability

The root explainability object attached to each candidate:

```typescript
interface Explainability {
  rule_id: string;        // e.g., "reco.comm.awaiting_reply"
  rule_version: string;   // Semantic version, e.g., "1.0.0"
  summary: string;        // Human-readable summary (max 200 chars)
  evidence: ExplainabilityEvidence[];  // At least one evidence item
}
```

### Evidence Items

Each evidence item represents a piece of supporting data:

```typescript
interface ExplainabilityEvidence {
  kind: 'state' | 'event' | 'correlation' | 'rule' | 'heuristic';
  label: string;         // Human-readable label (max 100 chars)
  refs: ExplainabilityRef[];  // At least one reference
  meta: Record<string, string | number | boolean | null>;
  sensitivity: 'low' | 'medium' | 'high';
}
```

### Evidence Kinds

| Kind | Description | Typical Use |
|------|-------------|-------------|
| `state` | Derived state from Redis | Thread counts, activity levels |
| `event` | Specific events | Calendar events, recent messages |
| `correlation` | Cross-source connections | Meeting-thread links |
| `rule` | Rule trigger marker | Always included last |
| `heuristic` | Time/context heuristics | End-of-day, weekly patterns |

### Reference Types

| Ref Type | Description |
|----------|-------------|
| `redis_key` | Key in Redis (state data) |
| `correlation_id` | Cross-source correlation identifier |
| `event_id` | Specific event reference |
| `object_ref` | Generic object reference |
| `rule_id` | Rule identifier |

## Rule Registry

All rules are registered in `rule-registry.ts` with stable identifiers and versions:

```typescript
const RULE_REGISTRY: Record<string, RuleDefinition> = {
  'reco.comm.awaiting_reply': {
    id: 'reco.comm.awaiting_reply',
    version: '1.0.0',
    name: 'Awaiting Reply',
    description: 'Threads where user is expected to respond',
    sources: ['mail', 'chat'],
    class: 'communication',
  },
  // ... more rules
};
```

### Rule ID Convention

Rule IDs follow the pattern: `reco.<class>.<rule_name>`

- `reco.comm.*` - Communication rules
- `reco.meeting.*` - Meeting/calendar rules
- `reco.focus.*` - Focus time rules
- `reco.planning.*` - Planning and review rules
- `reco.cleanup.*` - Housekeeping rules
- `reco.correlation.*` - Cross-source correlation rules

## Privacy Protection

### Forbidden Meta Fields

The following field names are forbidden in evidence meta to prevent PII leakage:

- `body` - Email/message body content
- `subject` - Email subjects
- `content` - Any content field
- `message` - Message text
- `text` - Any text content

The Zod schema enforces this at validation time:

```typescript
const ExplainabilityMetaSchema = z
  .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
  .refine(
    (meta) => !Object.keys(meta).some((key) =>
      FORBIDDEN_META_FIELDS.some((f) => key.toLowerCase().includes(f))
    ),
    { message: 'Meta contains forbidden sensitive fields' }
  );
```

### Sensitivity Levels

Evidence items declare their sensitivity:

- `low` - Safe for all contexts (counts, flags)
- `medium` - Contains timing/source info
- `high` - Should be filtered in some display contexts

## /why Endpoint

### Request

```
GET /recommendations/:userId/:candidateId/why
```

### Response

```typescript
interface WhyResponse {
  candidate_id: string;
  title: string;
  class: string;
  summary: string;
  evidence: ExplainabilityEvidence[];
  rendered_why: string;  // Human-readable explanation
}
```

### No-Numerals Policy

The `rendered_why` field contains no numerals. Numbers are converted to words:

| Value | Word |
|-------|------|
| 0 | no |
| 1 | one |
| 2 | two |
| 3 | three |
| 4 | four |
| 5 | five |
| 6-10 | several |
| 11-20 | many |
| 21+ | numerous |

This ensures human-friendly output without specific counts that might be distracting.

## Creating Evidence

Use the helper functions for consistent evidence creation:

```typescript
import {
  createStateEvidence,
  createCorrelationEvidence,
  createRuleEvidence,
  createEventEvidence,
  createHeuristicEvidence,
} from '@edulution/events';

// State evidence from Redis
const stateEvidence = createStateEvidence(
  'Threads awaiting reply',
  'state:comm:user1:awaiting',
  'mail',
  'today',
  { thread_count: 5 }
);

// Correlation evidence
const corrEvidence = createCorrelationEvidence(
  'Meeting preparation',
  'meeting-thread-correlation-123',
  { linked: true }
);

// Rule trigger evidence (always included)
const ruleEvidence = createRuleEvidence('reco.comm.awaiting_reply');

// Event evidence
const eventEvidence = createEventEvidence(
  'Upcoming meeting',
  'meeting-456',
  'caldav',
  '2024-01-15T10:00:00.000Z',
  { is_imminent: true }
);

// Heuristic evidence
const heuristicEvidence = createHeuristicEvidence(
  'End of day window',
  [{ ref_type: 'object_ref', ref: 'time-window', source: 'time' }],
  { hour: 17, is_eod: true }
);
```

## Implementing a New Rule

When implementing a new rule:

1. Add the rule to `rule-registry.ts` with a unique ID and version
2. Extend `BaseRule` and implement `evaluate()`
3. Use `createResult()` with `evidenceItems` for automatic explainability
4. Include at least one evidence item per result

```typescript
class MyNewRule extends BaseRule {
  readonly id = 'reco.focus.my_rule';
  readonly name = 'My New Rule';
  readonly class = RECOMMENDATION_CLASSES.FOCUS;
  readonly sources = ['signals'];
  readonly usesCorrelation = false;

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    const evidenceItems = [
      createStateEvidence(
        'Activity level',
        `state:signals:${context.user_id}:activity`,
        'signals',
        '1h',
        { level: context.signals.activity_level }
      ),
    ];

    return [
      this.createResult({
        class: this.class,
        title: 'My recommendation',
        rationale: 'Based on your activity patterns.',
        score: 0.7,
        evidenceItems,
        evidence: [{ kind: 'activity', ref: 'activity-1' }],
      }),
    ];
  }
}
```

## Evaluation and Metrics

The evaluation system tracks explainability statistics:

```typescript
interface ExplainabilityStats {
  total_candidates: number;
  with_explainability: number;
  evidence_kinds_distribution: Record<string, number>;
  avg_evidence_per_candidate: number;
  rule_ids_used: string[];
}
```

Run evaluations with:

```bash
npx tsx apps/api/src/evaluation/run-eval.ts --all
```

## Testing

Test files location:

- `apps/api/src/recommendations/rules/test/explainability.spec.ts` - Type validation tests
- `apps/api/src/recommendations/test/explainability.spec.ts` - Generator tests
- `apps/api/src/recommendations/test/why.spec.ts` - Endpoint tests

Run tests:

```bash
npm run test:api -- --testPathPattern=explainability
npm run test:api -- --testPathPattern=why
```

## Best Practices

1. **Always include rule evidence**: Use `createRuleEvidence()` as the last evidence item
2. **Keep labels concise**: Max 100 characters, describe what the evidence shows
3. **Use appropriate sensitivity**: Mark event-related evidence as `medium`
4. **Avoid PII in meta**: Never include email subjects, message content, or names
5. **Use semantic versioning**: Bump version when rule behavior changes
6. **Test evidence validity**: All evidence should pass Zod schema validation
