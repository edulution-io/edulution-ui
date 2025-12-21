# Cross-App-Intelligenz: Complete System Documentation

**Thesis Defense Documentation**
**Last Updated:** 2025-12-21
**Source:** Verified from actual codebase implementation

---

## Table of Contents

1. [Event System](#1-event-system)
2. [Cross-App Rules](#2-cross-app-rules)
3. [Deduplication Algorithm](#3-deduplication-algorithm)
4. [Ranking Algorithm](#4-ranking-algorithm)
5. [Evaluation Metrics](#5-evaluation-metrics)
6. [Demo Scenarios](#6-demo-scenarios)
7. [Cache Strategy](#7-cache-strategy)
8. [AI/LLM Integration](#8-aillm-integration)
9. [Architecture Diagrams](#9-architecture-diagrams)

---

## 1. Event System

### 1.1 Event Sources (10 total)

Defined in `packages/events/src/types.ts`:

```typescript
export const EVENT_SOURCES = {
  FILES: 'files',           // File operations
  CONFERENCES: 'conferences', // Video conferences
  MAIL: 'mail',             // Email system
  CALDAV: 'caldav',         // Calendar
  CHAT: 'chat',             // Messaging
  HTTP: 'http',             // HTTP requests
  SYSTEM: 'system',         // System events
  BULLETIN: 'bulletin',     // Announcements
  SURVEYS: 'surveys',       // Surveys
  WHITEBOARD: 'whiteboard', // Collaborative whiteboards
} as const;
```

### 1.2 Event Types (46 total)

| Source | Event Types | Count |
|--------|-------------|-------|
| **Files** | `file.created`, `file.uploaded`, `file.moved`, `file.copied`, `file.deleted`, `file.accessed`, `file.modified`, `file.shared`, `folder.created`, `folder.deleted` | 10 |
| **Conferences** | `conference.created`, `conference.started`, `conference.ended`, `conference.participant_joined`, `conference.participant_left`, `conference.recording_started`, `conference.recording_stopped` | 7 |
| **Mail** | `mail.received`, `mail.sent`, `mail.replied`, `mail.forwarded`, `mail.thread_created`, `mail.thread_closed` | 6 |
| **CalDAV** | `calendar.event_created`, `calendar.event_updated`, `calendar.event_deleted`, `calendar.event_started`, `calendar.event_ended`, `calendar.reminder_triggered` | 6 |
| **Chat** | `chat.message_sent`, `chat.message_received`, `chat.message_edited`, `chat.message_deleted`, `chat.channel_created`, `chat.channel_joined`, `chat.channel_left` | 7 |
| **HTTP** | `request.started`, `request.completed`, `request.failed` | 3 |
| **System** | `system.health_check`, `system.config_changed`, `system.error`, `system.startup`, `system.shutdown` | 5 |
| **Bulletin** | `bulletin.created`, `bulletin.updated`, `bulletin.deleted` | 3 |
| **Surveys** | `survey.created`, `survey.updated`, `survey.deleted`, `survey.answer_submitted` | 4 |
| **Whiteboard** | `whiteboard.session_started`, `whiteboard.session_ended` | 2 |

### 1.3 Canonical Event Schema

```typescript
interface Event {
  event_id: string;        // UUID
  schema_version: string;  // Semantic version
  occurred_at: string;     // ISO timestamp
  received_at: string;     // ISO timestamp
  tenant_id?: string;      // Multi-tenancy
  user_id: string;         // Required
  source: EventSource;     // One of 10 sources
  type: string;            // Event type
  actor_id?: string;       // Who triggered
  object: EventObject;     // What was affected
  context?: EventContext;  // Related context
  correlation_id: string;  // For tracing
  causation_id?: string;   // Parent event
  sensitivity: 'low' | 'medium' | 'high';
  metadata?: EventMetadata;
  payload?: EventPayload;
}
```

---

## 2. Cross-App Rules

### 2.1 Rule Summary (7 Cross-App Rules + 14 Standard Rules)

Located in `apps/api/src/recommendations/rules/cross-app/`:

| Rule ID | Trigger Event | Sources Involved | Generated Actions | Class |
|---------|--------------|------------------|-------------------|-------|
| `reco.cross.mail_attachment` | `mail.received` (has_attachments=true) | mail → files | `files.copy_file` for each attachment | cleanup |
| `reco.cross.conference_setup` | `conference.created` | conferences → files, chat | `files.create_folder`, `chat.create_group` | organization |
| `reco.cross.project_setup` | `project.created` | system → files, chat, files | `files.create_folder`, `chat.create_group`, `files.create_share_link` | organization |
| `reco.cross.class_setup` | `class.created` | system → files, chat, bulletin | `files.create_folder` (x2), `chat.create_group`, `files.share_folder`, `bulletin.create_announcement` | organization |
| `reco.cross.session_exam` | `session.started` (is_exam=true) | system → files, lmn | `files.create_folder`, `lmn.start_exam` | organization |
| `reco.cross.survey_announce` | `survey.created` | surveys → bulletin | `bulletin.create_announcement` | communication |
| `reco.cross.bulletin_notify` | `bulletin.created` (is_important=true) | bulletin → chat | `chat.send_message` (per group) | communication |

### 2.2 Standard Rules (14 rules)

| Category | Rule | Class | Trigger Condition |
|----------|------|-------|-------------------|
| **Communication** | `awaiting-reply` | communication | Threads waiting > threshold hours |
| **Communication** | `high-volume` | communication | High message volume detected |
| **Calendar** | `busy-day` | meeting | Many meetings scheduled |
| **Calendar** | `meeting-prep` | meeting | Meeting starting soon |
| **Focus** | `focus-time` | focus | Good conditions for focus |
| **Focus** | `break-suggestion` | focus | Extended work period |
| **Focus** | `low-activity` | focus | Low activity detected |
| **Planning** | `workload-review` | planning | Workload imbalance |
| **Planning** | `eod-review` | planning | End of day summary |
| **Planning** | `weekly` | planning | Weekly planning time |
| **Cleanup** | `stale-threads` | cleanup | Old unresolved threads |
| **Cleanup** | `inbox-zero` | cleanup | Inbox management needed |
| **Cleanup** | `organize-files` | cleanup | Files need organization |
| **Organization** | `conference-folder` | organization | Conference without folder |

### 2.3 Recommendation Classes (6 total)

```typescript
export const RECOMMENDATION_CLASSES = {
  COMMUNICATION: 'communication',  // Responding, messaging
  PLANNING: 'planning',            // Scheduling, reviewing
  CLEANUP: 'cleanup',              // Organizing, archiving
  FOCUS: 'focus',                  // Deep work, breaks
  MEETING: 'meeting',              // Preparation, attendance
  ORGANIZATION: 'organization',    // Setup, structuring
} as const;
```

---

## 3. Deduplication Algorithm

### 3.1 Implementation

Located in `apps/api/src/recommendations/utils/dedup.ts`:

```typescript
const DEFAULT_DEDUP_TTL_DAYS = 30;

function generateDedupKey(ruleId: string, contextId: string, userId: string): string {
  // Extract base rule ID (before colon if versioned)
  const baseRuleId = ruleId.split(':')[0];

  // Create deterministic input string
  const input = `${baseRuleId}|${contextId}|${userId}`;

  // SHA-256 hash, truncated to 16 chars
  const hash = crypto.createHash('sha256')
    .update(input)
    .digest('hex')
    .slice(0, 16);

  return `dedup:${baseRuleId}:${hash}`;
}

async function isDuplicate(redis: Redis, dedupKey: string): Promise<boolean> {
  const exists = await redis.exists(dedupKey);
  return exists === 1;
}

async function markAsProcessed(
  redis: Redis,
  dedupKey: string,
  ttlDays: number = DEFAULT_DEDUP_TTL_DAYS,
): Promise<void> {
  await redis.setex(dedupKey, ttlDays * 24 * 60 * 60, '1');
}
```

### 3.2 Deduplication Flow

```
Event arrives
    │
    ▼
Generate dedup key: SHA-256(ruleId|contextId|userId)
    │
    ▼
Check Redis: EXISTS dedup:rule:hash
    │
    ├── EXISTS = 1 → SKIP (duplicate)
    │
    └── EXISTS = 0 → PROCESS
            │
            ▼
        Generate recommendation
            │
            ▼
        SETEX dedup:rule:hash TTL=30d
```

### 3.3 TTL Configuration

- Default TTL: 30 days
- Per-rule override possible via rule configuration
- Redis key format: `dedup:{baseRuleId}:{hash16}`

---

## 4. Ranking Algorithm

### 4.1 Class Priority Weights

Located in `apps/api/src/recommendations/rules/rule-engine.service.ts`:

```typescript
/**
 * Priority order: meeting > communication > focus > planning > cleanup
 *
 * Rationale:
 * - Meeting: Highest priority due to fixed time constraints
 * - Communication: High priority for responsiveness expectations
 * - Focus: Important for productivity but can be deferred
 * - Planning: Valuable but flexible timing
 * - Cleanup: Low urgency housekeeping tasks
 */
const CLASS_PRIORITY: Record<string, number> = {
  meeting: 1.0,
  communication: 0.85,
  focus: 0.70,
  planning: 0.55,
  cleanup: 0.40,
};
```

### 4.2 Scoring Formula

```typescript
/**
 * Formula: score = CLASS*0.4 + URGENCY*0.3 + CONFIDENCE*0.3
 *
 * - CLASS (40%): Recommendation class priority
 * - URGENCY (30%): Time-based urgency from metadata
 * - CONFIDENCE (30%): Original rule-generated score
 */
const SCORING_WEIGHTS = {
  CLASS: 0.4,
  URGENCY: 0.3,
  CONFIDENCE: 0.3,
};

function calculateImprovedScore(
  candidate: RecommendationCandidate,
  ruleScore: number,
  metadata?: { meeting_time?: string; waiting_since?: string },
): number {
  const classPriority = CLASS_PRIORITY[candidate.class] || 0.5;
  const urgency = calculateUrgency(candidate, metadata);
  const confidence = ruleScore;

  const score =
    SCORING_WEIGHTS.CLASS * classPriority +
    SCORING_WEIGHTS.URGENCY * urgency +
    SCORING_WEIGHTS.CONFIDENCE * confidence;

  return Math.round(score * 1000) / 1000;
}
```

### 4.3 Urgency Calculation

```typescript
function calculateUrgency(candidate, metadata): number {
  const now = Date.now();

  // Meeting urgency (time until meeting)
  if (candidate.class === 'meeting' && metadata?.meeting_time) {
    const meetingTime = new Date(metadata.meeting_time).getTime();
    const hoursUntil = (meetingTime - now) / (1000 * 60 * 60);

    if (hoursUntil <= 0.5) return 1.0;   // < 30 min
    if (hoursUntil <= 1) return 0.9;     // < 1 hour
    if (hoursUntil <= 2) return 0.8;     // < 2 hours
    if (hoursUntil <= 4) return 0.6;     // < 4 hours
    return 0.4;
  }

  // Communication urgency (wait time)
  if (candidate.class === 'communication' && metadata?.waiting_since) {
    const waitingSince = new Date(metadata.waiting_since).getTime();
    const hoursWaiting = (now - waitingSince) / (1000 * 60 * 60);

    if (hoursWaiting >= 48) return 1.0;  // 2+ days
    if (hoursWaiting >= 24) return 0.8;  // 1+ day
    if (hoursWaiting >= 8) return 0.6;   // 8+ hours
    if (hoursWaiting >= 4) return 0.5;   // 4+ hours
    return 0.3;
  }

  return candidate.scores?.confidence || 0.5;
}
```

### 4.4 Sorting Variants

```typescript
// Variant A: Priority + Time (used when enableScoreRanking=false)
function sortByPriorityAndTime(candidates): candidates {
  const classPriority = {
    meeting: 1,
    communication: 2,
    focus: 3,
    planning: 4,
    cleanup: 5,
  };

  return [...candidates].sort((a, b) => {
    const priorityA = classPriority[a.candidate.class] || 99;
    const priorityB = classPriority[b.candidate.class] || 99;
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.candidate.created_at.localeCompare(b.candidate.created_at);
  });
}

// Variant B: Pure Score (used when enableScoreRanking=true)
function sortByScore(candidates): candidates {
  return [...candidates].sort((a, b) => b.score - a.score);
}
```

---

## 5. Evaluation Metrics

### 5.1 Metric Definitions

Located in `apps/api/src/evaluation/types.ts`:

```typescript
interface TimelineMetrics {
  precision_at_3_avg: number;       // Average precision across checkpoints
  coverage: boolean;                 // At least one relevant recommendation
  redundancy_rate: number;          // Rate of repeated classes
  latency_to_first_relevant: number | null;  // Checkpoints until first hit
}
```

### 5.2 Precision@3 Calculation

```typescript
function countRelevant(
  recommendations: Recommendation[],
  labels: ExpectedLabel[],
  checkpoint: string
): number {
  const checkpointTime = new Date(checkpoint).getTime();

  return recommendations.filter((rec) =>
    labels.some((label) => {
      const windowStart = new Date(label.window_start).getTime();
      const windowEnd = new Date(label.window_end).getTime();

      // Class must match AND checkpoint within time window
      return checkpointTime >= windowStart
          && checkpointTime <= windowEnd
          && rec.class === label.class;
    })
  ).length;
}

// Precision@3 = relevant_count / 3
// For each checkpoint: precision_at_3 = countRelevant(...) / limit
```

### 5.3 Coverage Calculation

```typescript
function calculateMetrics(results: CheckpointResult[]): TimelineMetrics {
  // Coverage: ANY checkpoint had a relevant recommendation
  const coverage = results.some((r) => r.relevant_count > 0);

  // Precision average
  const precision_at_3_avg =
    results.reduce((sum, r) => sum + r.precision_at_3, 0) / results.length;

  // Redundancy per checkpoint
  const perCheckpointRedundancy = results.map((r) => {
    const classes = r.generated.map((g) => g.class);
    const unique = new Set(classes);
    return classes.length > 0 ? 1 - unique.size / classes.length : 0;
  });

  const redundancy_rate = average(perCheckpointRedundancy);

  // Latency: checkpoints until first relevant
  const firstRelevantIndex = results.findIndex((r) => r.relevant_count > 0);
  const latency_to_first_relevant = firstRelevantIndex >= 0 ? firstRelevantIndex : null;

  return { precision_at_3_avg, coverage, redundancy_rate, latency_to_first_relevant };
}
```

### 5.4 Cross-Source Gain Rate

```typescript
/**
 * Measures added value of cross-app reasoning
 * = Relevant recommendations in 'full' NOT in 'single_source_only'
 */
function calculateCrossSourceGain(
  fullResults: CheckpointResult[],
  singleSourceResults: CheckpointResult[],
  labels: ExpectedLabel[],
): number {
  let fullRelevantCount = 0;
  let gainCount = 0;

  for (let i = 0; i < fullResults.checkpoints.length; i++) {
    const fullRelevant = fullCp.generated.filter(
      (rec) => isRelevant(rec, labels, checkpoint)
    );
    const singleRelevant = singleCp.generated.filter(
      (rec) => isRelevant(rec, labels, checkpoint)
    );

    for (const rec of fullRelevant) {
      fullRelevantCount++;
      const inSingle = singleRelevant.some(
        (sr) => sr.class === rec.class && sr.context_id === rec.context_id
      );
      if (!inSingle) gainCount++;
    }
  }

  return fullRelevantCount > 0 ? gainCount / fullRelevantCount : 0;
}
```

### 5.5 Ablation Study Variants

```typescript
const VALID_VARIANTS = [
  'full',              // All features enabled
  'no_correlation',    // Disable correlation signals
  'single_source_only', // Single-source rules only
  'no_ranking',        // Disable score-based ranking
] as const;
```

---

## 6. Demo Scenarios

### 6.1 Scenario Definitions

Located in `apps/api/src/demo/demo-data.service.ts`:

| Scenario | Events | Event Types | Purpose |
|----------|--------|-------------|---------|
| `cross_app_full` | 7 | conference, survey, project, class, session(exam), mail(attachments), bulletin(important) | Tests ALL cross-app rules |
| `cross_app_teacher` | 4 | 2x conference, 1x class, 1x session(exam) | Teacher workflow |
| `cross_app_admin` | 4 | 2x survey, 1x bulletin, 1x project | Admin workflow |
| `conference_heavy` | 5 | 5x conference (Mathematik, Deutsch, Englisch, Physik, Chemie) | Meeting-heavy day |
| `exam_day` | 4 | 4x session(is_exam=true) for classes 8a, 8b, 9a, 10b | Exam day |

### 6.2 Event Factory Functions

Located in `apps/api/src/demo/factories/cross-app-events.factory.ts`:

```typescript
// Conference event (triggers conference-setup rule)
createConferenceEvent({
  userId: string,
  subjectName: string,        // e.g., "Mathematik"
  participants?: string[],
  hour?: number,             // Scheduled hour
})

// Survey event (triggers survey-announce rule)
createSurveyEvent({
  userId: string,
  title: string,
  targetGroups?: string[],
})

// Class event (triggers class-setup rule with 5 actions)
createClassEvent({
  userId: string,
  className: string,          // e.g., "10a"
  students?: string[],
  teachers?: string[],
})

// Exam session (triggers session-exam rule)
createExamSessionEvent({
  userId: string,
  className: string,
  students?: string[],
  // Automatically sets is_exam: true
})

// Mail with attachments (triggers mail-attachment rule)
createMailWithAttachmentsEvent({
  userId: string,
  subject: string,
  attachments: Array<{ filename: string; size: number }>,
})

// Important bulletin (triggers bulletin-notify rule)
createImportantBulletinEvent({
  userId: string,
  title: string,
  targetGroups: Array<{ group_id: string; name: string; chat_id: string }>,
})
```

### 6.3 cross_app_full Scenario Detail

Creates exactly 7 events that trigger ALL 7 cross-app rules:

```
1. conference.created
   → triggers: reco.cross.conference_setup
   → actions: files.create_folder, chat.create_group

2. survey.created
   → triggers: reco.cross.survey_announce
   → actions: bulletin.create_announcement

3. project.created
   → triggers: reco.cross.project_setup
   → actions: files.create_folder, chat.create_group, files.create_share_link

4. class.created
   → triggers: reco.cross.class_setup
   → actions: files.create_folder(Materialien), files.create_folder(Abgaben),
              chat.create_group, files.share_folder, bulletin.create_announcement

5. session.started (is_exam=true)
   → triggers: reco.cross.session_exam
   → actions: files.create_folder, lmn.start_exam

6. mail.received (has_attachments=true)
   → triggers: reco.cross.mail_attachment
   → actions: files.copy_file (per attachment)

7. bulletin.created (is_important=true)
   → triggers: reco.cross.bulletin_notify
   → actions: chat.send_message (per group with chat_id)
```

---

## 7. Cache Strategy

### 7.1 Multi-Layer Architecture

Located in `apps/api/src/ai/daily-plan/daily-plan.service.ts`:

```
Request: GET /ai/daily-plan/:userId/:date
    │
    ▼
Layer 1: Input Hash Calculation
    │  └─ SHA-256(userId, date, summary, candidates)
    │
    ▼
Layer 2: Redis Check (~5ms)
    │  └─ Key: dailyplan:${userId}:${date}:${inputHash}
    │  └─ TTL: 7 days
    │
    ├── HIT → Return cached plan
    │
    └── MISS ─┐
              ▼
Layer 3: MongoDB Check (~20ms)
    │  └─ Collection: daily_plans
    │  └─ Index: { user_id, date, input_hash }
    │
    ├── HIT → Populate Redis → Return
    │
    └── MISS ─┐
              ▼
Layer 4: LLM Generation (~5000ms)
    │  └─ Generate with guardrails
    │  └─ Validate schema
    │  └─ Apply fallback if needed
    │
    ▼
Store: Redis + MongoDB
    │
    ▼
Return fresh plan
```

### 7.2 Input Hash Calculation

```typescript
function computeInputHash(
  userId: string,
  date: string,
  summarySnapshot: object,
  candidateSnapshots: object[],
): string {
  const normalized = {
    userId,
    date,
    summary: summarySnapshot,
    candidates: candidateSnapshots.sort((a, b) =>
      a.candidate_id.localeCompare(b.candidate_id)
    ),
  };

  return crypto
    .createHash('sha256')
    .update(JSON.stringify(normalized))
    .digest('hex');
}
```

### 7.3 Expected Hit Rates

| Layer | Expected Hit Rate | Latency |
|-------|------------------|---------|
| Redis | 70% | ~5ms |
| MongoDB | 20% | ~20ms |
| LLM Generation | 10% | ~5000ms |

---

## 8. AI/LLM Integration

### 8.1 Wo wird KI eingesetzt?

Die KI wird **ausschließlich** für die Daily Plan Generation verwendet - NICHT für:
- Event-Verarbeitung
- Rule-Evaluation
- Recommendation-Generierung
- Scoring/Ranking

### 8.2 AI Service Architecture

Located in `apps/api/src/ai/ai.service.ts`:

```typescript
// Multi-Provider Support
switch (apiStandard) {
  case AIProvider.ANTHROPIC:
    return createAnthropic({ apiKey, baseURL }).model(aiModel);
  case AIProvider.OPENAI:
    return createOpenAI({ apiKey, baseURL }).model(aiModel);
  case AIProvider.GOOGLE:
    return createGoogleGenerativeAI({ apiKey, baseURL }).model(aiModel);
  case AIProvider.OPENAI_COMPATIBLE:
    return createOpenAICompatible({ baseURL, apiKey }).chatModel(aiModel);
}

// Zwei Haupt-APIs:
async generateTextFromPrompt(configId: string, prompt: string): Promise<string>
async generateTextByPurpose(purpose: string, prompt: string): Promise<string>
```

### 8.3 Daily Plan Prompt Engineering

Located in `apps/api/src/ai/daily-plan/prompts/daily-plan.prompt.ts`:

**10 Strikte Regeln für LLM-Output:**

| Regel | Beschreibung | Beispiel |
|-------|--------------|----------|
| A: Source of Truth | Nur Fakten aus Input-JSON | Keine erfundenen Zahlen |
| B: No Numerals | Keine Ziffern in Text | "several" statt "3" |
| C: Priority Limits | 3-6 Priorities, rank 1-6 | Nie mehr als 6 |
| D: Candidate Linking | Muss linked_candidate_ids haben | Nur bekannte IDs |
| E: No Absolute Claims | Verboten: "no meetings" | "If you have meetings..." |
| F: Strict JSON | Nur valides JSON, kein Markdown | Kein ```json``` |
| G: Evidence-Based Why | Paraphrasiere Rationale | Keine Erfindungen |
| H: Schedule References | Items aus Priorities | Fokus muss spezifisch sein |
| I: No Absolute Time | Verboten: "soon", "shortly" | "later today" erlaubt |
| J: Evidence-Based Wording | Templates je Evidence-Kind | state/event/correlation |

### 8.4 Evidence-Based Wording Templates

```typescript
switch (evidenceKind) {
  case 'state':
    return `Based on ${source} activity, ${rationale}.`;

  case 'event':
    return `A ${source} event indicates ${rationale}.`;

  case 'correlation':
    return `Cross-source analysis suggests ${rationale}.`;

  case 'heuristic':
    return `Activity patterns indicate ${rationale}.`;
}
```

### 8.5 Post-LLM Guardrails

Located in `apps/api/src/ai/daily-plan/validators/guardrails.ts`:

```typescript
function runAllGuardrails(
  plan: AiDailyPlan,
  allowedCandidateIds: Set<string>,
): GuardrailResult {
  return [
    checkNoNumerals(plan),           // Keine Ziffern
    checkCandidateIdIntegrity(plan, allowedCandidateIds),  // Nur bekannte IDs
    checkNoForbiddenClaims(plan),    // Keine "no meetings"
    checkNoForbiddenTimeClaims(plan), // Keine "soon"
  ];
}
```

**Verbotene Muster:**

```typescript
const FORBIDDEN_PATTERNS = [
  /no meeting/i,
  /no meetings/i,
  /zero meeting/i,
  /don't have any meeting/i,
];

const FORBIDDEN_TIME_PATTERNS = [
  /\bsoon\b/i,
  /\bshortly\b/i,
  /\bin \d+ (minutes?|hours?)\b/i,
  /\bright now\b/i,
  /\bimmediately\b/i,
];
```

### 8.6 Deterministic Fallback

Located in `apps/api/src/ai/daily-plan/fallback/deterministic-plan.ts`:

Bei Guardrail-Verletzung → Template-basierter Plan OHNE LLM:

```typescript
function generateDeterministicPlan(
  userId: string,
  date: string,
  recommendations: RecommendationOutboxItem[],
  language?: string,
): AiDailyPlan {
  const topRecs = recommendations.slice(0, 3);

  const priorities = topRecs.map((rec, index) => ({
    rank: index + 1,
    title: truncate(rec.title, 80),
    why: generateEvidenceBasedWhy(rec, language),
    linked_candidate_ids: [rec.candidate_id],
    action_proposal: rec.action_proposal,
  }));

  return {
    user_id: userId,
    date,
    plan_title: getStrings(language).planTitle,
    priorities,
    schedule_suggestion: generateScheduleFromPriorities(priorities),
    recap: generateRecap(priorities, recommendations, language),
    notes: [],
    safety: { no_new_facts: true, numerals_allowed: false, checked: true },
    generated_at: new Date().toISOString(),
  };
}
```

### 8.7 LLM-Nutzung im Gesamtsystem

```
┌─────────────────────────────────────────────────────────────────┐
│                    RECOMMENDATION SYSTEM                         │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │  Events  │──►│  Rules   │──►│ Ranking  │──►│  Store   │     │
│  │(46 types)│   │(21 rules)│   │(formula) │   │ (Redis)  │     │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘     │
│                     ▲                              │             │
│                     │ Keine KI!                    │             │
│                     │ Regelbasiert                 ▼             │
└─────────────────────────────────────────────────────────────────┘
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DAILY PLAN SERVICE                           │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │  Cache   │──►│  Prompt  │──►│   LLM    │──►│Guardrails│     │
│  │  Check   │   │  Build   │   │  (hier!) │   │  Check   │     │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘     │
│       │              │              │              │             │
│       ▼              ▼              ▼              ▼             │
│   70% Redis      Sanitized     ~5000ms       Fallback bei       │
│   20% MongoDB    Input only    pro Plan      Verletzung         │
│   10% Fresh                                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 8.8 Sprach-Unterstützung

```typescript
type SupportedLanguage = 'de' | 'en' | 'fr';

const LANGUAGE_INSTRUCTIONS = {
  de: 'WICHTIG: Alle Textfelder MÜSSEN auf Deutsch verfasst sein.',
  en: 'IMPORTANT: All text fields MUST be written in English.',
  fr: 'IMPORTANT: Tous les champs DOIVENT être rédigés en français.',
};
```

### 8.9 Key Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| LLM-Aufrufe pro Tag | ~10% der Requests | 90% Cache-Hit |
| Durchschnittliche Latenz | ~5000ms | Bei Cache-Miss |
| Fallback-Rate | <5% | Guardrail-Verletzungen |
| Provider | Konfigurierbar | Anthropic/OpenAI/Google |

---

## 9. Architecture Diagrams

### 9.1 Complete Event Type Taxonomy

```
EVENT_SOURCES (10)
├── files (10 types)
│   ├── file.created, file.uploaded, file.moved
│   ├── file.copied, file.deleted, file.accessed
│   ├── file.modified, file.shared
│   └── folder.created, folder.deleted
├── conferences (7 types)
│   ├── conference.created, conference.started, conference.ended
│   ├── conference.participant_joined, conference.participant_left
│   └── conference.recording_started, conference.recording_stopped
├── mail (6 types)
│   ├── mail.received, mail.sent, mail.replied
│   ├── mail.forwarded, mail.thread_created
│   └── mail.thread_closed
├── caldav (6 types)
│   ├── calendar.event_created, calendar.event_updated
│   ├── calendar.event_deleted, calendar.event_started
│   └── calendar.event_ended, calendar.reminder_triggered
├── chat (7 types)
│   ├── chat.message_sent, chat.message_received
│   ├── chat.message_edited, chat.message_deleted
│   └── chat.channel_created, chat.channel_joined, chat.channel_left
├── http (3 types)
│   └── request.started, request.completed, request.failed
├── system (5 types)
│   └── system.health_check, system.config_changed, system.error
│       system.startup, system.shutdown
├── bulletin (3 types)
│   └── bulletin.created, bulletin.updated, bulletin.deleted
├── surveys (4 types)
│   └── survey.created, survey.updated, survey.deleted, survey.answer_submitted
└── whiteboard (2 types)
    └── whiteboard.session_started, whiteboard.session_ended
```

### 9.2 Cross-App Rule Trigger Map

```
TRIGGER EVENT                     RULE                         TARGET ACTIONS
─────────────────────────────────────────────────────────────────────────────
mail.received                 ──► mail-attachment        ──► files.copy_file
  (has_attachments=true)

conference.created            ──► conference-setup       ──► files.create_folder
                                                         ──► chat.create_group

project.created               ──► project-setup          ──► files.create_folder
                                                         ──► chat.create_group
                                                         ──► files.create_share_link

class.created                 ──► class-setup            ──► files.create_folder (x2)
                                                         ──► chat.create_group
                                                         ──► files.share_folder
                                                         ──► bulletin.create_announcement

session.started               ──► session-exam           ──► files.create_folder
  (is_exam=true)                                         ──► lmn.start_exam

survey.created                ──► survey-announce        ──► bulletin.create_announcement

bulletin.created              ──► bulletin-notify        ──► chat.send_message (per group)
  (is_important=true)
```

### 9.3 Ranking Algorithm Flow

```
Candidates from Rules
        │
        ▼
┌───────────────────────────────────────┐
│  Calculate Improved Score             │
│  score = 0.4*CLASS + 0.3*URGENCY     │
│        + 0.3*CONFIDENCE               │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│  Sort Options:                        │
│  A) Priority + Time (class-first)     │
│  B) Pure Score (score descending)     │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│  Apply Cooldown Filter                │
│  (4 hour cooldown per class/context)  │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│  Apply Diversity Filter               │
│  (max 2 per class)                    │
└───────────────────────────────────────┘
        │
        ▼
Final Ranked Recommendations
```

---

## Quick Reference Card

### Key Numbers

| Metric | Value | Source |
|--------|-------|--------|
| Event Sources | 10 | types.ts |
| Event Types | 46 | types.ts |
| Cross-App Rules | 7 | cross-app/*.rule.ts |
| Standard Rules | 14 | rules/**/*.rule.ts |
| Recommendation Classes | 6 | types.ts |
| Dedup TTL | 30 days | dedup.ts |
| Cooldown Period | 4 hours | rule-engine.service.ts |
| Max Per Class | 2 | rule-engine.service.ts |
| Cache TTL (Redis) | 7 days | plan-cache.service.ts |

### Class Priority Order

1. **meeting** (1.0) - Fixed time constraints
2. **communication** (0.85) - Responsiveness expectations
3. **focus** (0.70) - Productivity, deferrable
4. **planning** (0.55) - Flexible timing
5. **cleanup** (0.40) - Low urgency

### Scoring Weights

- CLASS: 40%
- URGENCY: 30%
- CONFIDENCE: 30%

---

*Document generated from verified source code analysis*
*Repository: edulution-ui*
*Branch: 1714-mcp-add-mcp-tool-and-ressources*
