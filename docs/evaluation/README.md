# Evaluation Framework for Recommendation System

This document describes the offline evaluation framework for testing the recommendation system's quality.

## Overview

The evaluation framework generates test scenarios (timelines), replays events through the recommendation engine, and measures precision against expected labels.

## Components

### 1. Timeline Generator (`apps/api/src/evaluation/timeline-generator.ts`)

Generates synthetic event timelines for different scenarios using the existing EventBuilder factory patterns.

**Scenarios:**

| ID | Name | Description | Expected Rules |
|----|------|-------------|----------------|
| `low_activity` | Low Activity Day | Minimal events | focus:low-activity, cleanup:inbox-zero |
| `busy_meeting` | Busy Meeting Day | 5+ meetings | calendar:meeting-prep, calendar:busy-day, planning:workload-review |
| `communication_heavy` | Communication Heavy | Many threads | communication:awaiting-reply, communication:high-volume |
| `mixed` | Mixed Activity | Meetings + emails + chat | calendar:meeting-prep, communication:awaiting-reply, focus:deep-work |
| `noisy` | Noisy Day | Many event types | cleanup:organize-files, focus:break-needed |

### 2. Timeline Generator Script (`apps/api/src/evaluation/generate-timelines.ts`)

Generates all 5 timeline JSON files to `apps/api/src/evaluation/timelines/`.

### 3. Evaluation Runner (`apps/api/src/evaluation/run-eval.ts`)

Replays timelines through the recommendation API and measures:

- **Precision@3**: Fraction of top-3 recommendations matching expected labels
- **Coverage**: Whether at least one relevant recommendation was made
- **Redundancy Rate**: Rate of repeated recommendation classes
- **Latency to First Relevant**: Checkpoints until first relevant recommendation

## Prerequisites

1. **API Server Running:**
   ```bash
   npm run api
   ```

2. **Redis Running:**
   ```bash
   docker compose up -d redis
   ```

3. **Generate Timelines (first time only):**
   ```bash
   npx tsx apps/api/src/evaluation/generate-timelines.ts
   ```

## Usage

### Generate Timelines

```bash
npx tsx apps/api/src/evaluation/generate-timelines.ts
```

Output: Timeline JSON files in `apps/api/src/evaluation/timelines/`

### Run All Evaluations

```bash
npx tsx apps/api/src/evaluation/run-eval.ts --all
```

### Run Specific Timeline

```bash
npx tsx apps/api/src/evaluation/run-eval.ts --timeline tl_001_low_activity
```

### CLI Options

| Option | Description |
|--------|-------------|
| `--all, -a` | Run all timelines |
| `--timeline, -t <id>` | Run specific timeline |
| `--verbose, -v` | Show detailed output |
| `--generate, -g` | Generate timelines only |
| `--help, -h` | Show help |

## Output

### Reports Directory

Reports are written to `docs/evaluation/reports/`:

- `<timeline_id>.json` - Raw evaluation data
- `<timeline_id>.md` - Markdown report with details
- `summary.json` - Aggregated metrics
- `summary.md` - Overall summary report

### Metrics Interpretation

| Metric | Target | Description |
|--------|--------|-------------|
| Precision@3 | > 60% | Fraction of top-3 recommendations matching expected labels |
| Coverage | 100% | All timelines should produce at least one relevant recommendation |
| Redundancy | < 30% | Recommendations should be diverse |

## Expected Labels (Auto-Generated)

Labels are auto-generated based on rule thresholds:

| Rule ID | Trigger | Class |
|---------|---------|-------|
| `calendar:meeting-prep` | Meeting within 120min | meeting |
| `calendar:busy-day` | >= 3 meetings | meeting |
| `communication:awaiting-reply` | Threads awaiting reply | communication |
| `communication:high-volume` | >= 5 awaiting threads | communication |
| `focus:deep-work` | High activity + no meetings in 2h | focus |
| `focus:break-needed` | >= 50 events in 1h | focus |
| `focus:low-activity` | Low activity + pending items | focus |
| `planning:workload-review` | >= 10 threads OR >= 3 meetings | planning |
| `cleanup:organize-files` | >= 20 file events in 24h | cleanup |
| `cleanup:inbox-zero` | <= 3 awaiting + <= 5 open | cleanup |

## Example Report

```
# Evaluation: Low Activity Day

**Timeline ID:** tl_001_low_activity
**Scenario:** low_activity
**Evaluated:** 2025-12-20T12:00:00.000Z

## Metrics Summary

| Metric | Value |
|--------|-------|
| Precision@3 (avg) | 66.7% |
| Coverage | Yes |
| Redundancy Rate | 33.3% |
| Latency to First Relevant | 1 checkpoints |
```

## Architecture

```
generate-timelines.ts
        |
        v
+-------------------+
|  Timeline Files   |  (apps/api/src/evaluation/timelines/*.json)
+-------------------+
        |
        v
   run-eval.ts
        |
        +---> Clear user state (Redis)
        |
        +---> Ingest events (API: /events/ingest)
        |
        +---> For each checkpoint:
        |        +---> Generate recommendations (API: /recommendations/{userId}/generate)
        |        +---> Fetch top-3 recommendations (API: /recommendations/{userId})
        |        +---> Compare with expected labels
        |
        v
+-------------------+
|  Report Files     |  (docs/evaluation/reports/*.md, *.json)
+-------------------+
```

## Troubleshooting

### API Not Running

```bash
curl -s http://localhost:3001/edu-api/events/ready | jq
# Should return: { "ready": true, ... }
```

### No Timelines Found

```bash
npx tsx apps/api/src/evaluation/generate-timelines.ts
```

### Redis Connection Failed

```bash
docker compose up -d redis
redis-cli ping
# Should return: PONG
```

### Recommendations Not Generated

Ensure the recommendation engine is properly initialized and rules are loaded.
