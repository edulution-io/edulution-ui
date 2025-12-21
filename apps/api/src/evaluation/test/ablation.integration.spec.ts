/*
 * LICENSE PLACEHOLDER
 */

import { existsSync, unlinkSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Redis from 'ioredis';
import { createTestTimeline } from './fixtures/test-timeline';
import {
  runEvaluationWithVariants,
  generateCompareMarkdown,
  generateCompareSummary,
  generateCompareSummaryMarkdown,
  clearUserState,
  clearRecommendationHistory,
  ingestEvents,
  populateStateKeys,
} from '../run-eval';
import type { VariantEvalResult, TimelineMetrics } from '../types';

const TIMELINES_DIR = join(__dirname, '../timelines');
const REPORTS_DIR = join(__dirname, '../../../../../../docs/evaluation/reports');
const API_BASE = process.env.API_URL || 'http://localhost:3001/edu-api';
const API_KEY = process.env.EVENTS_API_KEY || 'dev-events-key';

describe('Ablation Study Integration', () => {
  let testTimeline: ReturnType<typeof createTestTimeline>;
  let redis: Redis;
  let timelinePath: string;

  beforeAll(() => {
    testTimeline = createTestTimeline();
    timelinePath = join(TIMELINES_DIR, 'test_ablation_timeline.json');

    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });

    writeFileSync(timelinePath, JSON.stringify(testTimeline, null, 2));
  });

  afterAll(async () => {
    const keys = await redis.keys(`*${testTimeline.user_id}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    await redis.quit();

    if (existsSync(timelinePath)) {
      unlinkSync(timelinePath);
    }

    const testReportFiles = [
      'test_ablation_timeline.compare.json',
      'test_ablation_timeline.compare.md',
    ];
    for (const file of testReportFiles) {
      const path = join(REPORTS_DIR, file);
      if (existsSync(path)) {
        unlinkSync(path);
      }
    }
  });

  describe('Variant API Endpoints', () => {
    beforeEach(async () => {
      await clearUserState(testTimeline.user_id);
      await clearRecommendationHistory(testTimeline.user_id);
      await ingestEvents(testTimeline.events);
      await populateStateKeys(testTimeline.user_id, testTimeline.events);
    });

    it('should generate recommendations with full variant', async () => {
      const response = await fetch(
        `${API_BASE}/recommendations/${testTimeline.user_id}/generate?force=true&variant=full`,
        {
          method: 'POST',
          headers: { 'x-events-api-key': API_KEY },
        },
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.variant).toBe('full');
      expect(typeof data.candidates_generated).toBe('number');
    });

    it('should generate recommendations with no_correlation variant', async () => {
      const response = await fetch(
        `${API_BASE}/recommendations/${testTimeline.user_id}/generate?force=true&variant=no_correlation`,
        {
          method: 'POST',
          headers: { 'x-events-api-key': API_KEY },
        },
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.variant).toBe('no_correlation');
    });

    it('should generate recommendations with single_source_only variant', async () => {
      const response = await fetch(
        `${API_BASE}/recommendations/${testTimeline.user_id}/generate?force=true&variant=single_source_only`,
        {
          method: 'POST',
          headers: { 'x-events-api-key': API_KEY },
        },
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.variant).toBe('single_source_only');
    });

    it('should generate recommendations with no_ranking variant', async () => {
      const response = await fetch(
        `${API_BASE}/recommendations/${testTimeline.user_id}/generate?force=true&variant=no_ranking`,
        {
          method: 'POST',
          headers: { 'x-events-api-key': API_KEY },
        },
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.variant).toBe('no_ranking');
    });
  });

  describe('Multi-Variant Evaluation', () => {
    let result: VariantEvalResult;

    beforeAll(async () => {
      result = await runEvaluationWithVariants(
        'test_ablation_timeline',
        ['full', 'no_correlation', 'single_source_only', 'no_ranking'],
        3,
        false,
      );
    });

    it('should evaluate all four variants', () => {
      expect(result.variants).toHaveProperty('full');
      expect(result.variants).toHaveProperty('no_correlation');
      expect(result.variants).toHaveProperty('single_source_only');
      expect(result.variants).toHaveProperty('no_ranking');
    });

    it('should have metrics for each variant', () => {
      for (const variant of ['full', 'no_correlation', 'single_source_only', 'no_ranking']) {
        const {metrics} = result.variants[variant];
        expect(metrics).toHaveProperty('precision_at_3_avg');
        expect(metrics).toHaveProperty('coverage');
        expect(metrics).toHaveProperty('redundancy_rate');
        expect(metrics).toHaveProperty('latency_to_first_relevant');
      }
    });

    it('should have checkpoints for each variant', () => {
      for (const variant of ['full', 'no_correlation', 'single_source_only', 'no_ranking']) {
        expect(result.variants[variant].checkpoints).toHaveLength(1);
      }
    });

    it('should calculate comparison metrics', () => {
      expect(result.comparison).toBeDefined();
      expect(result.comparison?.baseline).toBe('full');
      expect(result.comparison?.deltas).toHaveProperty('no_correlation');
      expect(result.comparison?.deltas).toHaveProperty('single_source_only');
      expect(result.comparison?.deltas).toHaveProperty('no_ranking');
    });

    it('should calculate cross-source gain rate', () => {
      expect(typeof result.comparison?.cross_source_gain_rate).toBe('number');
      expect(result.comparison?.cross_source_gain_rate).toBeGreaterThanOrEqual(0);
      expect(result.comparison?.cross_source_gain_rate).toBeLessThanOrEqual(1);
    });

    it('should have valid delta values', () => {
      const deltas = result.comparison?.deltas;
      expect(deltas).toBeDefined();

      for (const variant of ['no_correlation', 'single_source_only', 'no_ranking']) {
        const delta = deltas![variant];
        expect(typeof delta.delta_precision).toBe('number');
        expect(typeof delta.delta_coverage).toBe('number');
        expect(delta.delta_precision).toBeGreaterThanOrEqual(-1);
        expect(delta.delta_precision).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Comparison Report Generation', () => {
    it('should generate comparison markdown with all sections', () => {
      const mockResult: VariantEvalResult = {
        timeline_id: 'test',
        timeline_name: 'Test Timeline',
        scenario: 'test',
        expected_labels: [],
        variants: {
          full: {
            checkpoints: [
              {
                checkpoint_index: 0,
                timestamp: '2025-12-20T10:00:00.000Z',
                generated: [],
                relevant_count: 2,
                precision_at_3: 0.67,
              },
            ],
            metrics: {
              precision_at_3_avg: 0.67,
              coverage: true,
              redundancy_rate: 0.1,
              latency_to_first_relevant: 0,
            },
          },
          no_correlation: {
            checkpoints: [
              {
                checkpoint_index: 0,
                timestamp: '2025-12-20T10:00:00.000Z',
                generated: [],
                relevant_count: 1,
                precision_at_3: 0.33,
              },
            ],
            metrics: {
              precision_at_3_avg: 0.33,
              coverage: true,
              redundancy_rate: 0.1,
              latency_to_first_relevant: 0,
            },
          },
        },
        comparison: {
          baseline: 'full',
          deltas: {
            no_correlation: { delta_precision: -0.34, delta_coverage: 0, delta_latency: 0 },
          },
          cross_source_gain_rate: 0.25,
        },
        evaluated_at: new Date().toISOString(),
      };

      const markdown = generateCompareMarkdown(mockResult);

      expect(markdown).toContain('# Evaluation: Test Timeline');
      expect(markdown).toContain('full');
      expect(markdown).toContain('no_correlation');
      expect(markdown).toContain('67.0%');
      expect(markdown).toContain('Cross-Source Gain Rate');
      expect(markdown).toContain('25.0%');
    });

    it('should generate comparison summary with all metrics', () => {
      const mockResults: VariantEvalResult[] = [
        {
          timeline_id: 'test1',
          timeline_name: 'Test 1',
          scenario: 'test',
          expected_labels: [],
          variants: {
            full: {
              checkpoints: [],
              metrics: {
                precision_at_3_avg: 0.8,
                coverage: true,
                redundancy_rate: 0.1,
                latency_to_first_relevant: 0,
              },
            },
            no_correlation: {
              checkpoints: [],
              metrics: {
                precision_at_3_avg: 0.6,
                coverage: true,
                redundancy_rate: 0.15,
                latency_to_first_relevant: 1,
              },
            },
            single_source_only: {
              checkpoints: [],
              metrics: {
                precision_at_3_avg: 0.5,
                coverage: false,
                redundancy_rate: 0.2,
                latency_to_first_relevant: null,
              },
            },
          },
          comparison: {
            baseline: 'full',
            deltas: {
              no_correlation: { delta_precision: -0.2, delta_coverage: 0, delta_latency: 1 },
              single_source_only: { delta_precision: -0.3, delta_coverage: -1, delta_latency: null },
            },
            cross_source_gain_rate: 0.3,
          },
          evaluated_at: '',
        },
      ];

      const summary = generateCompareSummary(mockResults);

      expect(summary.total_timelines).toBe(1);
      expect(summary.variants).toContain('full');
      expect(summary.variants).toContain('no_correlation');
      expect(summary.variant_metrics.full.avg_precision).toBe(0.8);
      expect(summary.avg_deltas.no_correlation.avg_delta_precision).toBe(-0.2);
      expect(summary.cross_source.avg_gain_rate).toBe(0.3);
    });

    it('should categorize high and low gain scenarios', () => {
      const mockResults: VariantEvalResult[] = [
        {
          timeline_id: 'high_gain',
          timeline_name: 'High Gain Scenario',
          scenario: 'test',
          expected_labels: [],
          variants: { full: { checkpoints: [], metrics: {} as TimelineMetrics } },
          comparison: { baseline: 'full', deltas: {}, cross_source_gain_rate: 0.35 },
          evaluated_at: '',
        },
        {
          timeline_id: 'low_gain',
          timeline_name: 'Low Gain Scenario',
          scenario: 'test',
          expected_labels: [],
          variants: { full: { checkpoints: [], metrics: {} as TimelineMetrics } },
          comparison: { baseline: 'full', deltas: {}, cross_source_gain_rate: 0.02 },
          evaluated_at: '',
        },
      ];

      const summary = generateCompareSummary(mockResults);

      expect(summary.cross_source.high_gain_scenarios).toContain('High Gain Scenario');
      expect(summary.cross_source.low_gain_scenarios).toContain('Low Gain Scenario');
    });

    it('should generate summary markdown with ablation interpretation', () => {
      const mockResults: VariantEvalResult[] = [
        {
          timeline_id: 'test1',
          timeline_name: 'Test',
          scenario: 'test',
          expected_labels: [],
          variants: {
            full: {
              checkpoints: [],
              metrics: {
                precision_at_3_avg: 0.8,
                coverage: true,
                redundancy_rate: 0.1,
                latency_to_first_relevant: 0,
              },
            },
            no_correlation: {
              checkpoints: [],
              metrics: {
                precision_at_3_avg: 0.6,
                coverage: true,
                redundancy_rate: 0.1,
                latency_to_first_relevant: 0,
              },
            },
            single_source_only: {
              checkpoints: [],
              metrics: {
                precision_at_3_avg: 0.5,
                coverage: true,
                redundancy_rate: 0.1,
                latency_to_first_relevant: 0,
              },
            },
            no_ranking: {
              checkpoints: [],
              metrics: {
                precision_at_3_avg: 0.7,
                coverage: true,
                redundancy_rate: 0.1,
                latency_to_first_relevant: 0,
              },
            },
          },
          comparison: {
            baseline: 'full',
            deltas: {
              no_correlation: { delta_precision: -0.2, delta_coverage: 0, delta_latency: 0 },
              single_source_only: { delta_precision: -0.3, delta_coverage: 0, delta_latency: 0 },
              no_ranking: { delta_precision: -0.1, delta_coverage: 0, delta_latency: 0 },
            },
            cross_source_gain_rate: 0.25,
          },
          evaluated_at: '',
        },
      ];

      const markdown = generateCompareSummaryMarkdown(mockResults);

      expect(markdown).toContain('# Ablation Study Summary');
      expect(markdown).toContain('Component Contribution');
      expect(markdown).toContain('Cross-Source Reasoning Impact');
      expect(markdown).toContain('Ablation Interpretation');
      expect(markdown).toContain('Correlation Contribution');
      expect(markdown).toContain('Cross-Source Contribution');
      expect(markdown).toContain('Ranking Contribution');
    });
  });

  describe('Report File Generation', () => {
    it('should verify comparison report file structure', () => {
      const summaryPath = join(REPORTS_DIR, 'summary.compare.md');

      if (existsSync(summaryPath)) {
        const content = readFileSync(summaryPath, 'utf-8');
        expect(content).toContain('Ablation Study Summary');
        expect(content).toContain('Overall Metrics by Variant');
        expect(content).toContain('Component Contribution');
      }
    });

    it('should verify per-timeline comparison report exists after evaluation', async () => {
      const result = await runEvaluationWithVariants(
        'test_ablation_timeline',
        ['full', 'no_correlation'],
        3,
        false,
      );

      const reportPath = join(REPORTS_DIR, 'test_ablation_timeline.compare.json');
      writeFileSync(reportPath, JSON.stringify(result, null, 2));

      expect(existsSync(reportPath)).toBe(true);

      const savedResult = JSON.parse(readFileSync(reportPath, 'utf-8'));
      expect(savedResult.timeline_id).toBe('test_ablation_timeline');
      expect(savedResult.variants).toHaveProperty('full');
      expect(savedResult.variants).toHaveProperty('no_correlation');

      unlinkSync(reportPath);
    });
  });
});
