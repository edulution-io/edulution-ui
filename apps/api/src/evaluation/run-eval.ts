#!/usr/bin/env npx tsx
/*
 * Evaluation Runner for Recommendation System
 *
 * Runs timelines, measures precision/coverage/redundancy metrics,
 * and generates reports.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Redis from 'ioredis';
import type { Event } from '@edulution/events';
import type { ExpectedLabel, GeneratedTimeline } from './timeline-generator';
import { VALID_VARIANTS, type RecommendationVariant } from '../recommendations/variants/variant.types';
import type {
  Recommendation,
  CheckpointResult,
  TimelineMetrics,
  EvalResult,
  VariantEvalResult,
  VariantComparison,
  RunOptions,
  CompareSummary,
  ExplainabilityStats,
  CandidateEvalResult,
} from './types';

const API_BASE = process.env.API_URL || 'http://localhost:3001/edu-api';
const API_KEY = process.env.EVENTS_API_KEY || 'dev-events-key';
const TIMELINES_DIR = join(__dirname, 'timelines');
const REPORTS_DIR = join(__dirname, '../../../../../docs/evaluation/reports');

const DEFAULT_VARIANT: RecommendationVariant = 'full';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function createRedisClient(): Redis {
  return new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  });
}

/**
 * Clear user state but preserve recommendation history for cooldown
 */
async function clearUserState(userId: string): Promise<void> {
  const redis = createRedisClient();

  try {
    const keys = await redis.keys(`*${userId}*`);

    // Filter out history keys - we want cooldown to work across timelines
    const keysToDelete = keys.filter((k) => !k.startsWith('reco:history:'));

    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
    }
  } finally {
    await redis.quit();
  }
}

/**
 * Clear recommendation outbox so each checkpoint gets fresh recommendations
 */
async function clearRecommendationOutbox(userId: string): Promise<void> {
  const redis = createRedisClient();

  try {
    // Clear the user's outbox (ZSET of candidate scores)
    await redis.del(`reco:outbox:user:${userId}`);

    // Note: We don't clear individual candidate keys here because
    // they have TTL and other users might reference them
  } finally {
    await redis.quit();
  }
}

/**
 * Clear recommendation history to start fresh evaluation
 */
async function clearRecommendationHistory(userId: string): Promise<void> {
  const redis = createRedisClient();

  try {
    await redis.del(`reco:history:${userId}`);
  } finally {
    await redis.quit();
  }
}

async function ingestEvents(events: Event[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const event of events) {
    try {
      const response = await fetch(`${API_BASE}/events/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-events-api-key': API_KEY,
        },
        body: JSON.stringify({
          event,
          idempotency_key: `eval-${event.object?.object_id}-${event.occurred_at}`,
        }),
      });

      const result = await response.json();
      if (result.success) {
        success++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Directly populate state keys from events (bypass worker for deterministic testing)
 * @param checkpointTime - If provided, only process events that occurred before this time
 */
async function populateStateKeys(userId: string, events: Event[], checkpointTime?: string): Promise<void> {
  const redis = createRedisClient();

  try {
    const pipeline = redis.pipeline();
    const calendarKey = `state:calendar:${userId}:upcoming`;
    const countsKey = `state:user:${userId}:counts:24h`;
    const counts1hKey = `state:user:${userId}:counts:1h`;
    const lastSeenKey = `state:user:${userId}:lastseen`;
    const openThreadsKey = `state:communications:${userId}:open`;
    const awaitingKey = `state:communications:${userId}:awaiting`;

    const counts: Record<string, number> = {};
    const lastSeen: Record<string, string> = {};
    const threads: Map<string, { lastActivity: number; hasReply: boolean }> = new Map();
    const meetings: Array<{ id: string; scheduledAt: string }> = [];

    // Filter events to only include those that occurred before the checkpoint
    const relevantEvents = checkpointTime
      ? events.filter((e) => new Date(e.occurred_at).getTime() <= new Date(checkpointTime).getTime())
      : events;

    for (const event of relevantEvents) {
      // Count events by type
      counts[event.type] = (counts[event.type] || 0) + 1;

      // Track last seen per source
      const currentLast = lastSeen[event.source];
      if (!currentLast || event.occurred_at > currentLast) {
        lastSeen[event.source] = event.occurred_at;
      }

      // Calendar events
      if (event.source === 'caldav' && event.type === 'calendar.event_created') {
        const scheduledAt = (event.metadata?.scheduled_at || event.metadata?.start_time) as string | undefined;
        if (scheduledAt) {
          meetings.push({ id: event.object.object_id, scheduledAt });
        }
      }

      // Mail threads
      if (event.source === 'mail') {
        const threadId = event.context?.thread_id as string | undefined;
        if (threadId) {
          const timestamp = new Date(event.occurred_at).getTime();
          const existing = threads.get(threadId) || { lastActivity: 0, hasReply: false };
          existing.lastActivity = Math.max(existing.lastActivity, timestamp);

          if (event.type === 'mail.sent' || event.type === 'mail.replied') {
            existing.hasReply = true;
          }
          threads.set(threadId, existing);
        }
      }
    }

    // Store calendar meetings
    for (const meeting of meetings) {
      const score = new Date(meeting.scheduledAt).getTime();
      pipeline.zadd(
        calendarKey,
        score,
        JSON.stringify({
          meeting_id: meeting.id,
          scheduled_at: meeting.scheduledAt,
        }),
      );
    }

    // Store thread state
    for (const [threadId, data] of threads) {
      pipeline.zadd(openThreadsKey, data.lastActivity, threadId);
      if (!data.hasReply) {
        pipeline.sadd(awaitingKey, threadId);
      }
    }

    // Store counts
    for (const [eventType, count] of Object.entries(counts)) {
      pipeline.hincrby(countsKey, eventType, count);
      pipeline.hincrby(counts1hKey, eventType, count);
    }

    // Store last seen
    for (const [source, timestamp] of Object.entries(lastSeen)) {
      pipeline.hset(lastSeenKey, source, timestamp);
    }

    // Set TTLs
    pipeline.expire(countsKey, 86400);
    pipeline.expire(counts1hKey, 3600);
    pipeline.expire(lastSeenKey, 86400);
    pipeline.expire(calendarKey, 86400);
    pipeline.expire(openThreadsKey, 86400);
    pipeline.expire(awaitingKey, 86400);

    await pipeline.exec();
  } finally {
    await redis.quit();
  }
}

/**
 * Generate recommendations with force=true to bypass cooldown for evaluation
 */
async function generateRecommendations(
  userId: string,
  variant: RecommendationVariant = DEFAULT_VARIANT,
): Promise<{ generated: number; skipped: number }> {
  try {
    const response = await fetch(`${API_BASE}/recommendations/${userId}/generate?force=true&variant=${variant}`, {
      method: 'POST',
      headers: { 'x-events-api-key': API_KEY },
    });
    const data = await response.json();
    return {
      generated: data.candidates_generated || 0,
      skipped: data.candidates_skipped || 0,
    };
  } catch {
    return { generated: 0, skipped: 0 };
  }
}

async function fetchRecommendations(userId: string, limit = 3): Promise<Recommendation[]> {
  try {
    const response = await fetch(`${API_BASE}/recommendations/${userId}?limit=${limit}&diverse=true`, {
      headers: { 'x-events-api-key': API_KEY },
    });

    const data = await response.json();
    return data.recommendations || [];
  } catch {
    return [];
  }
}

/**
 * Count how many recommendations match expected labels at this checkpoint
 */
function countRelevant(recommendations: Recommendation[], labels: ExpectedLabel[], checkpoint: string): number {
  const checkpointTime = new Date(checkpoint).getTime();

  return recommendations.filter((rec) => labels.some((label) => {
      const windowStart = new Date(label.window_start).getTime();
      const windowEnd = new Date(label.window_end).getTime();

      // Check if checkpoint is within label window AND class matches
      return checkpointTime >= windowStart && checkpointTime <= windowEnd && rec.class === label.class;
    })).length;
}

/**
 * Calculate aggregate metrics from checkpoint results
 */
function calculateMetrics(results: CheckpointResult[]): TimelineMetrics {
  if (results.length === 0) {
    return {
      precision_at_3_avg: 0,
      coverage: false,
      redundancy_rate: 0,
      latency_to_first_relevant: null,
    };
  }

  // Average precision across checkpoints
  const precision_at_3_avg = results.reduce((sum, r) => sum + r.precision_at_3, 0) / results.length;

  // Coverage: did ANY checkpoint have a relevant recommendation?
  const coverage = results.some((r) => r.relevant_count > 0);

  // Redundancy: average per-checkpoint redundancy (measures diversity within each checkpoint)
  const perCheckpointRedundancy = results.map((r) => {
    const classes = r.generated.map((g) => g.class);
    const unique = new Set(classes);
    return classes.length > 0 ? 1 - unique.size / classes.length : 0;
  });
  const redundancy_rate =
    perCheckpointRedundancy.length > 0
      ? perCheckpointRedundancy.reduce((s, r) => s + r, 0) / perCheckpointRedundancy.length
      : 0;

  // Latency: how many checkpoints until first relevant?
  const firstRelevantIndex = results.findIndex((r) => r.relevant_count > 0);
  const latency_to_first_relevant = firstRelevantIndex >= 0 ? firstRelevantIndex : null;

  return {
    precision_at_3_avg,
    coverage,
    redundancy_rate,
    latency_to_first_relevant,
  };
}

/**
 * Calculate explainability statistics from checkpoint results
 */
function calculateExplainabilityStats(results: CheckpointResult[]): ExplainabilityStats {
  const allCandidates = results.flatMap((r) => r.generated);
  const withExplainability = allCandidates.filter((c) => c.explainability);
  const evidenceKinds: Record<string, number> = {};
  const ruleIds = new Set<string>();
  let totalEvidence = 0;

  withExplainability.forEach((candidate) => {
    const exp = candidate.explainability!;
    ruleIds.add(exp.rule_id);

    exp.evidence.forEach((item) => {
      evidenceKinds[item.kind] = (evidenceKinds[item.kind] || 0) + 1;
      totalEvidence++;
    });
  });

  return {
    total_candidates: allCandidates.length,
    with_explainability: withExplainability.length,
    evidence_kinds_distribution: evidenceKinds,
    avg_evidence_per_candidate: withExplainability.length > 0 ? totalEvidence / withExplainability.length : 0,
    rule_ids_used: Array.from(ruleIds),
  };
}

/**
 * Serialize a candidate with explainability data for evaluation output
 */
function serializeCandidate(
  candidate: Recommendation,
  relevant: boolean,
): CandidateEvalResult {
  return {
    candidate_id: candidate.candidate_id,
    class: candidate.class,
    title: candidate.title,
    score: candidate.score,
    is_relevant: relevant,
    rule_id: candidate.explainability?.rule_id || 'unknown',
    evidence_kinds: candidate.explainability?.evidence.map((e) => e.kind) || [],
    evidence_count: candidate.explainability?.evidence.length || 0,
  };
}

function generateMarkdownReport(result: EvalResult): string {
  return `# Evaluation: ${result.timeline_name}

**Timeline ID:** \`${result.timeline_id}\`  
**Scenario:** ${result.scenario}  
**Evaluated:** ${result.evaluated_at}

## Expected Labels

| Class | Window Start | Window End | Rule |
|-------|--------------|------------|------|
${result.expected_labels
  .map(
    (l) =>
      `| ${l.class} | ${new Date(l.window_start).toISOString()} | ${new Date(l.window_end).toISOString()} | ${l.rule_id} |`,
  )
  .join('\n')}

## Metrics Summary

| Metric | Value |
|--------|-------|
| Precision@3 (avg) | ${(result.metrics.precision_at_3_avg * 100).toFixed(1)}% |
| Coverage | ${result.metrics.coverage ? '✅ Yes' : '❌ No'} |
| Redundancy Rate | ${(result.metrics.redundancy_rate * 100).toFixed(1)}% |
| Latency to First Relevant | ${result.metrics.latency_to_first_relevant ?? 'N/A'} checkpoints |

## Checkpoint Details

${result.checkpoints
  .map(
    (cp, i) => `
### Checkpoint ${i + 1}: ${new Date(cp.timestamp).toISOString()}

**Top 3 Recommendations:**
${
  cp.generated.length > 0
    ? cp.generated.map((r) => `- [${r.class}] ${r.title} (score: ${r.score.toFixed(2)})`).join('\n')
    : '- None generated'
}

**Relevant Count:** ${cp.relevant_count}/3  
**Precision@3:** ${(cp.precision_at_3 * 100).toFixed(1)}%
`,
  )
  .join('\n')}

---
*Generated by Evaluation Framework*
`;
}

function generateSummaryReport(results: EvalResult[]): string {
  const avgPrecision = results.reduce((s, r) => s + r.metrics.precision_at_3_avg, 0) / results.length;
  const coverageRate = results.filter((r) => r.metrics.coverage).length / results.length;
  const avgRedundancy = results.reduce((s, r) => s + r.metrics.redundancy_rate, 0) / results.length;

  return `# Evaluation Summary

**Generated:** ${new Date().toISOString()}

## Overall Metrics

| Metric | Value |
|--------|-------|
| Timelines Evaluated | ${results.length} |
| Average Precision@3 | ${(avgPrecision * 100).toFixed(1)}% |
| Coverage Rate | ${(coverageRate * 100).toFixed(1)}% |
| Average Redundancy | ${(avgRedundancy * 100).toFixed(1)}% |

## Per-Timeline Results

| Timeline | Scenario | Precision@3 | Coverage | Redundancy |
|----------|----------|-------------|----------|------------|
${results
  .map(
    (r) =>
      `| ${r.timeline_name} | ${r.scenario} | ${(r.metrics.precision_at_3_avg * 100).toFixed(1)}% | ${r.metrics.coverage ? '✅' : '❌'} | ${(r.metrics.redundancy_rate * 100).toFixed(1)}% |`,
  )
  .join('\n')}

## Interpretation

- **Precision@3**: How many of the top 3 recommendations matched expected labels
- **Coverage**: Whether at least one relevant recommendation was made
- **Redundancy**: Rate of repeated recommendation classes (lower = more diverse)
- **Target**: Precision > 50%, Coverage > 80%, Redundancy < 30%

## Analysis

### Well-Performing Scenarios
${
  results
    .filter((r) => r.metrics.precision_at_3_avg > 0.5)
    .map((r) => `- ${r.timeline_name}: ${(r.metrics.precision_at_3_avg * 100).toFixed(0)}%`)
    .join('\n') || '- None above 50% precision'
}

### Needs Improvement
${
  results
    .filter((r) => r.metrics.precision_at_3_avg < 0.3)
    .map((r) => `- ${r.timeline_name}: ${(r.metrics.precision_at_3_avg * 100).toFixed(0)}%`)
    .join('\n') || '- All scenarios above 30% precision'
}

---
*Generated by Evaluation Framework*
`;
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function printHelp(): void {
  console.log(`
Evaluation Runner - Recommendation System

Usage:
  npx tsx run-eval.ts [options]

Options:
  --all, -a              Run all timelines
  --timeline, -t <id>    Run specific timeline
  --verbose, -v          Verbose output
  --variants <list>      Comma-separated variants (default: full)
                         Options: full,no_correlation,single_source_only,no_ranking
  --compare              Run all variants and generate comparison report
  --limit <n>            Number of recommendations to fetch (default: 3)
  --help, -h             Show this help

Examples:
  npx tsx run-eval.ts --all
  npx tsx run-eval.ts --all --compare --verbose
  npx tsx run-eval.ts --all --variants full,no_correlation
  npx tsx run-eval.ts --timeline tl_001_low_activity --compare
`);
}

function parseArgs(): RunOptions {
  const args = process.argv.slice(2);
  const options: RunOptions = {
    runAll: false,
    specificTimeline: null,
    verbose: false,
    variants: [DEFAULT_VARIANT],
    compareMode: false,
    limit: 3,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--all':
      case '-a':
        options.runAll = true;
        break;
      case '--timeline':
      case '-t':
        options.specificTimeline = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--variants': {
        const variantList = args[++i].split(',');
        options.variants = variantList.filter((v) =>
          VALID_VARIANTS.includes(v as RecommendationVariant),
        ) as RecommendationVariant[];
        break;
      }
      case '--compare':
        options.compareMode = true;
        options.variants = [...VALID_VARIANTS];
        break;
      case '--limit':
        options.limit = parseInt(args[++i], 10);
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

/**
 * Check if a recommendation is relevant based on expected labels at a checkpoint
 */
function isRelevant(rec: Recommendation, labels: ExpectedLabel[], checkpoint: string): boolean {
  const checkpointTime = new Date(checkpoint).getTime();

  return labels.some((label) => {
    const windowStart = new Date(label.window_start).getTime();
    const windowEnd = new Date(label.window_end).getTime();

    return checkpointTime >= windowStart && checkpointTime <= windowEnd && rec.class === label.class;
  });
}

/**
 * Calculate latency delta between variant and baseline
 */
function calculateLatencyDelta(
  variantLatency: number | null,
  baselineLatency: number | null,
): number | null {
  if (variantLatency === null || baselineLatency === null) {
    return null;
  }
  return variantLatency - baselineLatency;
}

/**
 * Cross-Source Gain Rate:
 * Fraction of relevant recommendations in 'full' that are NOT in 'single_source_only'
 *
 * This quantifies the added value of cross-app reasoning.
 */
function calculateCrossSourceGain(
  fullResults: { checkpoints: CheckpointResult[] },
  singleSourceResults: { checkpoints: CheckpointResult[] } | undefined,
  labels: ExpectedLabel[],
): number {
  if (!singleSourceResults) {
    return 0;
  }

  let fullRelevantCount = 0;
  let gainCount = 0;

  for (let i = 0; i < fullResults.checkpoints.length; i++) {
    const fullCp = fullResults.checkpoints[i];
    const singleCp = singleSourceResults.checkpoints[i];

    const fullRelevant = fullCp.generated.filter((rec) => isRelevant(rec, labels, fullCp.timestamp));
    const singleRelevant = singleCp.generated.filter((rec) => isRelevant(rec, labels, singleCp.timestamp));

    for (const rec of fullRelevant) {
      fullRelevantCount++;

      const inSingle = singleRelevant.some(
        (sr) => sr.class === rec.class && sr.context_id === rec.context_id,
      );

      if (!inSingle) {
        gainCount++;
      }
    }
  }

  return fullRelevantCount > 0 ? gainCount / fullRelevantCount : 0;
}

/**
 * Calculate comparison metrics between variants
 */
function calculateComparison(
  variantResults: VariantEvalResult['variants'],
  expectedLabels: ExpectedLabel[],
): VariantComparison {
  const baseline = variantResults.full;
  if (!baseline) {
    throw new Error('Full variant required for comparison');
  }

  const deltas: VariantComparison['deltas'] = {};

  for (const [variant, result] of Object.entries(variantResults)) {
    if (variant === 'full') continue;

    deltas[variant] = {
      delta_precision: result.metrics.precision_at_3_avg - baseline.metrics.precision_at_3_avg,
      delta_coverage: (result.metrics.coverage ? 1 : 0) - (baseline.metrics.coverage ? 1 : 0),
      delta_latency: calculateLatencyDelta(
        result.metrics.latency_to_first_relevant,
        baseline.metrics.latency_to_first_relevant,
      ),
    };
  }

  const crossSourceGainRate = calculateCrossSourceGain(
    variantResults.full,
    variantResults.single_source_only,
    expectedLabels,
  );

  return {
    baseline: 'full',
    deltas,
    cross_source_gain_rate: crossSourceGainRate,
  };
}

/**
 * Run evaluation for multiple variants on a single timeline
 */
async function runEvaluationWithVariants(
  timelineId: string,
  variants: RecommendationVariant[],
  limit: number,
  verbose: boolean,
): Promise<VariantEvalResult> {
  const timelinePath = join(TIMELINES_DIR, `${timelineId}.json`);

  if (!existsSync(timelinePath)) {
    throw new Error(`Timeline not found: ${timelinePath}`);
  }

  const timeline: GeneratedTimeline = JSON.parse(readFileSync(timelinePath, 'utf-8'));

  if (verbose) {
    console.log(`  User: ${timeline.user_id}`);
    console.log(`  Events: ${timeline.events.length}`);
    console.log(`  Checkpoints: ${timeline.checkpoints.length}`);
    console.log(`  Expected Labels: ${timeline.expected_labels.length}`);
    console.log(`  Variants: ${variants.join(', ')}`);
  }

  const variantResults: VariantEvalResult['variants'] = {};

  for (const variant of variants) {
    if (verbose) {
      console.log(`    Running variant: ${variant}`);
    }

    // Clear state before each variant run
    await clearUserState(timeline.user_id);
    await clearRecommendationHistory(timeline.user_id);

    // Ingest events once per variant (for fresh state)
    await ingestEvents(timeline.events);
    await sleep(500);

    const checkpointResults: CheckpointResult[] = [];

    for (let i = 0; i < timeline.checkpoints.length; i++) {
      const checkpoint = timeline.checkpoints[i];

      // Clear user state before each checkpoint to simulate state at that point in time
      await clearUserState(timeline.user_id);

      // Populate state with only events that occurred before this checkpoint
      await populateStateKeys(timeline.user_id, timeline.events, checkpoint);

      // Clear outbox before each checkpoint to get fresh recommendations
      await clearRecommendationOutbox(timeline.user_id);

      // Generate new recommendations with this variant
      const genResult = await generateRecommendations(timeline.user_id, variant);

      if (verbose) {
        console.log(`      Checkpoint ${i + 1}: Generated ${genResult.generated}, Skipped ${genResult.skipped}`);
      }

      await sleep(100);

      // Fetch top recommendations
      const recommendations = await fetchRecommendations(timeline.user_id, limit);

      // Count how many are relevant based on expected labels
      const relevantCount = countRelevant(recommendations, timeline.expected_labels, checkpoint);

      checkpointResults.push({
        checkpoint_index: i,
        timestamp: checkpoint,
        generated: recommendations,
        relevant_count: relevantCount,
        precision_at_3: recommendations.length > 0 ? relevantCount / limit : 0,
      });

      if (verbose) {
        const classes = recommendations.map((r) => r.class).join(', ');
        console.log(`        → ${relevantCount}/${limit} relevant | Classes: [${classes}]`);
      }
    }

    const metrics = calculateMetrics(checkpointResults);
    const explainabilityStats = calculateExplainabilityStats(checkpointResults);

    variantResults[variant] = {
      checkpoints: checkpointResults,
      metrics,
      explainability_stats: explainabilityStats,
    };

    if (verbose) {
      console.log(`      → Precision: ${(metrics.precision_at_3_avg * 100).toFixed(1)}%`);
    }
  }

  // Calculate comparison if multiple variants and 'full' is included
  let comparison: VariantComparison | undefined;
  if (variants.length > 1 && variants.includes('full')) {
    comparison = calculateComparison(variantResults, timeline.expected_labels);
  }

  return {
    timeline_id: timelineId,
    timeline_name: timeline.name,
    scenario: timeline.scenario,
    expected_labels: timeline.expected_labels,
    variants: variantResults,
    comparison,
    evaluated_at: new Date().toISOString(),
  };
}

/**
 * Convert variant result to single-variant EvalResult for backwards compatibility
 */
function convertToSingleVariantResult(result: VariantEvalResult, variant: RecommendationVariant): EvalResult {
  const variantData = result.variants[variant];
  if (!variantData) {
    throw new Error(`Variant ${variant} not found in results`);
  }

  return {
    timeline_id: result.timeline_id,
    timeline_name: result.timeline_name,
    scenario: result.scenario,
    expected_labels: result.expected_labels,
    checkpoints: variantData.checkpoints,
    metrics: variantData.metrics,
    evaluated_at: result.evaluated_at,
  };
}

/**
 * Generate markdown report for variant comparison
 */
function generateCompareMarkdown(result: VariantEvalResult): string {
  const variants = Object.keys(result.variants);

  let report = `# Evaluation: ${result.timeline_name}

**Timeline ID:** \`${result.timeline_id}\`
**Scenario:** ${result.scenario}
**Evaluated:** ${result.evaluated_at}
**Mode:** Variant Comparison

## Expected Labels

| Class | Window Start | Window End | Rule |
|-------|--------------|------------|------|
${result.expected_labels
  .map(
    (l) =>
      `| ${l.class} | ${new Date(l.window_start).toISOString()} | ${new Date(l.window_end).toISOString()} | ${l.rule_id} |`,
  )
  .join('\n')}

## Variant Metrics

| Variant | Precision@3 | Coverage | Redundancy | Latency |
|---------|-------------|----------|------------|---------|
${variants
  .map((v) => {
    const m = result.variants[v].metrics;
    return `| ${v} | ${(m.precision_at_3_avg * 100).toFixed(1)}% | ${m.coverage ? '✅' : '❌'} | ${(m.redundancy_rate * 100).toFixed(1)}% | ${m.latency_to_first_relevant ?? 'N/A'} |`;
  })
  .join('\n')}

## Explainability Stats

| Variant | With Explainability | Avg Evidence | Top Rule |
|---------|---------------------|--------------|----------|
${variants
  .map((v) => {
    const stats = result.variants[v].explainability_stats;
    if (!stats) return `| ${v} | N/A | N/A | N/A |`;
    const coverage = stats.total_candidates > 0 ? `${stats.with_explainability}/${stats.total_candidates}` : '0/0';
    const topRule = stats.rule_ids_used[0] || 'N/A';
    return `| ${v} | ${coverage} | ${stats.avg_evidence_per_candidate.toFixed(1)} | ${topRule} |`;
  })
  .join('\n')}

`;

  if (result.comparison) {
    report += `## Comparison (vs ${result.comparison.baseline})

| Variant | Δ Precision | Δ Coverage | Δ Latency |
|---------|-------------|------------|-----------|
${Object.entries(result.comparison.deltas)
  .map(([v, d]) => {
    const precSign = d.delta_precision >= 0 ? '+' : '';
    const covSign = d.delta_coverage >= 0 ? '+' : '';
    const latSign = d.delta_latency !== null && d.delta_latency >= 0 ? '+' : '';
    return `| ${v} | ${precSign}${(d.delta_precision * 100).toFixed(1)}% | ${covSign}${d.delta_coverage} | ${d.delta_latency !== null ? latSign + d.delta_latency : 'N/A'} |`;
  })
  .join('\n')}

**Cross-Source Gain Rate:** ${(result.comparison.cross_source_gain_rate * 100).toFixed(1)}%

> The cross-source gain rate measures how many relevant recommendations in the 'full' variant
> would NOT have been generated with 'single_source_only'. Higher = more value from cross-app reasoning.

`;
  }

  report += `## Checkpoint Details

`;

  for (const variant of variants) {
    const variantData = result.variants[variant];
    report += `### Variant: ${variant}

${variantData.checkpoints
  .map(
    (cp, i) => `
#### Checkpoint ${i + 1}: ${new Date(cp.timestamp).toISOString()}

**Top Recommendations:**
${
  cp.generated.length > 0
    ? cp.generated.map((r) => `- [${r.class}] ${r.title} (score: ${r.score.toFixed(2)})`).join('\n')
    : '- None generated'
}

**Relevant Count:** ${cp.relevant_count}/${cp.generated.length}
**Precision:** ${(cp.precision_at_3 * 100).toFixed(1)}%
`,
  )
  .join('\n')}

`;
  }

  report += `---
*Generated by Evaluation Framework - Variant Comparison Mode*
`;

  return report;
}

/**
 * Helper function to calculate average
 */
function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Generate summary report for comparison across all timelines
 */
function generateCompareSummary(results: VariantEvalResult[]): CompareSummary {
  const variants = Object.keys(results[0].variants);

  const variantMetrics: CompareSummary['variant_metrics'] = {};
  for (const variant of variants) {
    const precisions: number[] = results.map((r) => r.variants[variant]?.metrics.precision_at_3_avg || 0);
    const coverages: number[] = results.map((r) => (r.variants[variant]?.metrics.coverage ? 1 : 0));
    const redundancies: number[] = results.map((r) => r.variants[variant]?.metrics.redundancy_rate || 0);

    variantMetrics[variant] = {
      avg_precision: average(precisions),
      coverage_rate: average(coverages),
      avg_redundancy: average(redundancies),
    };
  }

  const avgDeltas: CompareSummary['avg_deltas'] = {};
  for (const variant of variants) {
    if (variant === 'full') continue;

    const deltas = results.map((r) => r.comparison?.deltas[variant]).filter(Boolean);

    if (deltas.length > 0) {
      avgDeltas[variant] = {
        avg_delta_precision: average(deltas.map((d) => d!.delta_precision)),
        avg_delta_coverage: average(deltas.map((d) => d!.delta_coverage)),
      };
    }
  }

  const crossSourceGains = results.map((r) => r.comparison?.cross_source_gain_rate || 0);
  const highGainScenarios = results
    .filter((r) => (r.comparison?.cross_source_gain_rate || 0) > 0.2)
    .map((r) => r.timeline_name);
  const lowGainScenarios = results
    .filter((r) => (r.comparison?.cross_source_gain_rate || 0) < 0.05)
    .map((r) => r.timeline_name);

  return {
    evaluated_at: new Date().toISOString(),
    total_timelines: results.length,
    variants,
    variant_metrics: variantMetrics,
    avg_deltas: avgDeltas,
    cross_source: {
      avg_gain_rate: average(crossSourceGains),
      high_gain_scenarios: highGainScenarios,
      low_gain_scenarios: lowGainScenarios,
    },
    results: results.map((r) => ({
      timeline_id: r.timeline_id,
      scenario: r.scenario,
      variant_precisions: Object.fromEntries(
        Object.entries(r.variants).map(([v, data]) => [v, data.metrics.precision_at_3_avg]),
      ),
      cross_source_gain: r.comparison?.cross_source_gain_rate || 0,
    })),
  };
}

/**
 * Format a delta value with sign
 */
function formatDelta(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(1)}%`;
}

/**
 * Interpret delta for a specific variant
 */
function interpretDelta(
  variant: string,
  delta: { avg_delta_precision: number; avg_delta_coverage: number },
): string {
  switch (variant) {
    case 'no_correlation':
      if (delta.avg_delta_precision < -0.1) {
        return 'Correlation significantly improves precision';
      } if (delta.avg_delta_precision < -0.02) {
        return 'Correlation provides modest benefit';
      } 
        return 'System works well without correlation';
      
    case 'single_source_only':
      if (delta.avg_delta_precision < -0.15) {
        return 'Cross-source rules are critical';
      } if (delta.avg_delta_precision < -0.05) {
        return 'Cross-source provides meaningful benefit';
      } 
        return 'Single-source rules are sufficient';
      
    case 'no_ranking':
      if (delta.avg_delta_precision < -0.1) {
        return 'Score-based ranking is important';
      } if (delta.avg_delta_precision < -0.02) {
        return 'Ranking provides some benefit';
      } 
        return 'Order has minimal impact';
      
    default:
      return '';
  }
}

/**
 * Generate interpretation for correlation contribution
 */
function generateCorrelationInterpretation(summary: CompareSummary): string {
  const delta = summary.avg_deltas.no_correlation;
  if (!delta) return 'No correlation variant tested.';

  if (delta.avg_delta_precision < -0.1) {
    return `Disabling correlation reduces precision by ${formatDelta(delta.avg_delta_precision)}. Cross-source correlation signals are a key driver of recommendation quality.`;
  } if (delta.avg_delta_precision < -0.02) {
    return `Correlation provides a modest ${formatDelta(-delta.avg_delta_precision)} improvement. The system benefits from cross-source signals but is not dependent on them.`;
  } 
    return `Minimal impact from correlation (${formatDelta(delta.avg_delta_precision)}). Current rules may not heavily utilize correlation signals, or the test scenarios don't expose correlation benefits.`;
  
}

/**
 * Generate interpretation for cross-source contribution
 */
function generateCrossSourceInterpretation(summary: CompareSummary): string {
  const delta = summary.avg_deltas.single_source_only;
  const gainRate = summary.cross_source.avg_gain_rate;

  if (!delta) return 'No single-source variant tested.';

  let interpretation = `Cross-source gain rate: ${(gainRate * 100).toFixed(1)}%. `;

  if (gainRate > 0.2) {
    interpretation += `This is significant - ${(gainRate * 100).toFixed(0)}% of relevant recommendations come from cross-source reasoning that single-source rules cannot produce.`;
  } else if (gainRate > 0.05) {
    interpretation += `Cross-source reasoning adds value in specific scenarios, particularly: ${summary.cross_source.high_gain_scenarios.join(', ') || 'none identified'}.`;
  } else {
    interpretation +=
      'Current implementation primarily relies on single-source rules. Consider adding more cross-source rules to increase this metric.';
  }

  return interpretation;
}

/**
 * Generate interpretation for ranking contribution
 */
function generateRankingInterpretation(summary: CompareSummary): string {
  const delta = summary.avg_deltas.no_ranking;
  if (!delta) return 'No ranking variant tested.';

  if (delta.avg_delta_precision < -0.1) {
    return `Score-based ranking is critical, providing ${formatDelta(-delta.avg_delta_precision)} precision improvement. The scoring algorithm effectively prioritizes relevant recommendations.`;
  } if (delta.avg_delta_precision < -0.02) {
    return `Ranking contributes ${formatDelta(-delta.avg_delta_precision)} to precision. The scoring algorithm adds value but is not the primary driver.`;
  } 
    return `Minimal ranking impact (${formatDelta(delta.avg_delta_precision)}). This could mean scores are well-calibrated (all relevant items score similarly) or that rule priority already provides good ordering.`;
  
}

/**
 * Generate markdown summary for comparison across all timelines
 */
function generateCompareSummaryMarkdown(results: VariantEvalResult[]): string {
  const summary = generateCompareSummary(results);

  const report = `# Ablation Study Summary

**Generated:** ${summary.evaluated_at}
**Timelines Evaluated:** ${summary.total_timelines}
**Variants:** ${summary.variants.join(', ')}

## Overall Metrics by Variant

| Variant | Precision@3 | Coverage | Redundancy |
|---------|-------------|----------|------------|
${Object.entries(summary.variant_metrics)
  .map(
    ([v, m]) =>
      `| ${v} | ${(m.avg_precision * 100).toFixed(1)}% | ${(m.coverage_rate * 100).toFixed(1)}% | ${(m.avg_redundancy * 100).toFixed(1)}% |`,
  )
  .join('\n')}

## Component Contribution (Deltas vs Full)

| Variant | ΔPrecision | ΔCoverage | Interpretation |
|---------|------------|-----------|----------------|
${Object.entries(summary.avg_deltas)
  .map(([v, d]) => {
    const interpretation = interpretDelta(v, d);
    return `| ${v} | ${formatDelta(d.avg_delta_precision)} | ${formatDelta(d.avg_delta_coverage)} | ${interpretation} |`;
  })
  .join('\n')}

## Cross-Source Reasoning Impact

**Average Cross-Source Gain Rate:** ${(summary.cross_source.avg_gain_rate * 100).toFixed(1)}%

This metric shows what fraction of \`full\`'s relevant recommendations are NOT produced by \`single_source_only\`.

### High-Gain Scenarios (>20%)
${summary.cross_source.high_gain_scenarios.length > 0 ? summary.cross_source.high_gain_scenarios.map((s) => `- ${s}`).join('\n') : '- None'}

### Low-Gain Scenarios (<5%)
${summary.cross_source.low_gain_scenarios.length > 0 ? summary.cross_source.low_gain_scenarios.map((s) => `- ${s}`).join('\n') : '- None'}

## Per-Timeline Results

| Timeline | Scenario | ${summary.variants.map((v) => `${v} P@3`).join(' | ')} | XS Gain |
|----------|----------|${summary.variants.map(() => '---').join(' | ')}|---------|
${summary.results
  .map((r) => {
    const precs = summary.variants.map((v) => `${(r.variant_precisions[v] * 100).toFixed(0)}%`).join(' | ');
    return `| ${r.timeline_id} | ${r.scenario} | ${precs} | ${(r.cross_source_gain * 100).toFixed(0)}% |`;
  })
  .join('\n')}

## Variant Performance Ranking

${Object.entries(summary.variant_metrics)
  .sort(([, a], [, b]) => b.avg_precision - a.avg_precision)
  .map(([v, m], i) => `${i + 1}. **${v}**: ${(m.avg_precision * 100).toFixed(1)}% precision`)
  .join('\n')}

## Ablation Interpretation

### Correlation Contribution
${generateCorrelationInterpretation(summary)}

### Cross-Source Contribution
${generateCrossSourceInterpretation(summary)}

### Ranking Contribution
${generateRankingInterpretation(summary)}

---
*Generated by Ablation Study Framework*
`;

  return report;
}

function listTimelines(): string[] {
  if (!existsSync(TIMELINES_DIR)) {
    return [];
  }

  return readdirSync(TIMELINES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}

async function main(): Promise<void> {
  const options = parseArgs();

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║       Evaluation Runner - Recommendation System          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`API: ${API_BASE}`);
  console.log(`Variants: ${options.variants.join(', ')}`);
  console.log(`Compare Mode: ${options.compareMode ? 'Yes' : 'No'}`);
  console.log(`Limit: ${options.limit}`);
  console.log('');

  ensureDir(REPORTS_DIR);

  if (options.runAll || options.specificTimeline) {
    const timelines = options.specificTimeline ? [options.specificTimeline] : listTimelines();

    if (timelines.length === 0) {
      console.log('No timelines found in', TIMELINES_DIR);
      console.log('Run: npx tsx apps/api/src/evaluation/generate-timelines.ts');
      process.exit(1);
    }

    console.log(`Found ${timelines.length} timelines\n`);

    if (options.compareMode || options.variants.length > 1) {
      // Variant comparison mode
      const results: VariantEvalResult[] = [];

      for (const tl of timelines) {
        console.log(`━━━ Running: ${tl} ━━━`);

        const result = await runEvaluationWithVariants(tl, options.variants, options.limit, options.verbose);
        results.push(result);

        // Write per-timeline comparison reports
        writeFileSync(join(REPORTS_DIR, `${tl}.compare.json`), JSON.stringify(result, null, 2));
        writeFileSync(join(REPORTS_DIR, `${tl}.compare.md`), generateCompareMarkdown(result));

        // Print summary per variant
        for (const variant of options.variants) {
          const metrics = result.variants[variant]?.metrics;
          if (metrics) {
            console.log(`  [${variant}] Precision: ${(metrics.precision_at_3_avg * 100).toFixed(1)}%`);
          }
        }

        if (result.comparison) {
          console.log(`  Cross-Source Gain: ${(result.comparison.cross_source_gain_rate * 100).toFixed(1)}%`);
        }
        console.log('');
      }

      // Write comparison summary reports
      const summary = generateCompareSummary(results);
      writeFileSync(join(REPORTS_DIR, 'summary.compare.json'), JSON.stringify(summary, null, 2));
      writeFileSync(join(REPORTS_DIR, 'summary.compare.md'), generateCompareSummaryMarkdown(results));

      // Print overall summary
      console.log('═══════════════════════════════════════════════════════════');
      console.log('COMPARISON SUMMARY');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`  Timelines: ${results.length}`);
      console.log('');

      for (const variant of options.variants) {
        const vm = summary.variant_metrics[variant];
        if (vm) {
          console.log(`  [${variant}]`);
          console.log(`    Precision@3:  ${(vm.avg_precision * 100).toFixed(1)}%`);
          console.log(`    Coverage:     ${(vm.coverage_rate * 100).toFixed(1)}%`);
          console.log(`    Redundancy:   ${(vm.avg_redundancy * 100).toFixed(1)}%`);
        }
      }

      console.log('');
      console.log(`  Cross-Source Gain (avg): ${(summary.cross_source.avg_gain_rate * 100).toFixed(1)}%`);
      console.log('');
      console.log(`Comparison reports: ${REPORTS_DIR}/`);
      console.log('');
    } else {
      // Single variant mode (backwards compatible)
      const results: EvalResult[] = [];

      for (const tl of timelines) {
        console.log(`━━━ Running: ${tl} ━━━`);

        // Run with variants but extract single variant result
        const variantResult = await runEvaluationWithVariants(
          tl,
          options.variants,
          options.limit,
          options.verbose,
        );
        const result = convertToSingleVariantResult(variantResult, options.variants[0]);
        results.push(result);

        // Write individual reports
        writeFileSync(join(REPORTS_DIR, `${tl}.json`), JSON.stringify(result, null, 2));
        writeFileSync(join(REPORTS_DIR, `${tl}.md`), generateMarkdownReport(result));

        console.log(`  ✓ Precision@3: ${(result.metrics.precision_at_3_avg * 100).toFixed(1)}%`);
        console.log(`  ✓ Coverage: ${result.metrics.coverage ? 'Yes' : 'No'}`);
        console.log(`  ✓ Redundancy: ${(result.metrics.redundancy_rate * 100).toFixed(1)}%`);
        console.log('');
      }

      // Write summary reports
      writeFileSync(join(REPORTS_DIR, 'summary.md'), generateSummaryReport(results));
      writeFileSync(
        join(REPORTS_DIR, 'summary.json'),
        JSON.stringify(
          {
            evaluated_at: new Date().toISOString(),
            total_timelines: results.length,
            variant: options.variants[0],
            avg_precision: results.reduce((s, r) => s + r.metrics.precision_at_3_avg, 0) / results.length,
            coverage_rate: results.filter((r) => r.metrics.coverage).length / results.length,
            avg_redundancy: results.reduce((s, r) => s + r.metrics.redundancy_rate, 0) / results.length,
            results: results.map((r) => ({
              timeline_id: r.timeline_id,
              scenario: r.scenario,
              precision: r.metrics.precision_at_3_avg,
              coverage: r.metrics.coverage,
              redundancy: r.metrics.redundancy_rate,
            })),
          },
          null,
          2,
        ),
      );

      console.log('═══════════════════════════════════════════════════════════');
      console.log('SUMMARY');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`  Timelines:    ${results.length}`);
      console.log(`  Variant:      ${options.variants[0]}`);
      console.log(
        `  Precision@3:  ${((results.reduce((s, r) => s + r.metrics.precision_at_3_avg, 0) / results.length) * 100).toFixed(1)}%`,
      );
      console.log(
        `  Coverage:     ${((results.filter((r) => r.metrics.coverage).length / results.length) * 100).toFixed(1)}%`,
      );
      console.log(
        `  Redundancy:   ${((results.reduce((s, r) => s + r.metrics.redundancy_rate, 0) / results.length) * 100).toFixed(1)}%`,
      );
      console.log('');
      console.log(`Reports: ${REPORTS_DIR}/`);
      console.log('');
    }
  } else {
    console.log('Usage:');
    console.log('  npx tsx run-eval.ts --all');
    console.log('  npx tsx run-eval.ts --all --compare');
    console.log('  npx tsx run-eval.ts --all --variants full,no_correlation');
    console.log('  npx tsx run-eval.ts --timeline <timeline_id>');
    console.log('  npx tsx run-eval.ts --timeline <timeline_id> --compare');
    console.log('');
    console.log('Available timelines:');
    listTimelines().forEach((tl) => console.log(`  - ${tl}`));
    console.log('');
    console.log('Available variants:');
    VALID_VARIANTS.forEach((v) => console.log(`  - ${v}`));
  }
}

main().catch((err) => {
  console.error('Evaluation failed:', err);
  process.exit(1);
});

export {
  runEvaluationWithVariants,
  generateCompareMarkdown,
  generateCompareSummary,
  generateCompareSummaryMarkdown,
  calculateMetrics,
  calculateExplainabilityStats,
  serializeCandidate,
  countRelevant,
  clearUserState,
  clearRecommendationOutbox,
  clearRecommendationHistory,
  ingestEvents,
  populateStateKeys,
  generateRecommendations,
  fetchRecommendations,
};
