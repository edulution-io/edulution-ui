/*
 * LICENSE PLACEHOLDER
 */

import type { RecommendationClass, Explainability } from '@edulution/events';
import type { ExpectedLabel } from './timeline-generator';
import type { RecommendationVariant } from '../recommendations/variants/variant.types';

export interface Recommendation {
  candidate_id: string;
  class: RecommendationClass;
  title: string;
  score: number;
  rationale: string;
  context_id?: string;
  explainability?: Explainability;
}

export interface CandidateEvalResult {
  candidate_id: string;
  class: string;
  title: string;
  score: number;
  is_relevant: boolean;
  rule_id: string;
  evidence_kinds: string[];
  evidence_count: number;
}

export interface ExplainabilityStats {
  total_candidates: number;
  with_explainability: number;
  evidence_kinds_distribution: Record<string, number>;
  avg_evidence_per_candidate: number;
  rule_ids_used: string[];
}

export interface CheckpointResult {
  checkpoint_index: number;
  timestamp: string;
  generated: Recommendation[];
  relevant_count: number;
  precision_at_3: number;
}

export interface TimelineMetrics {
  precision_at_3_avg: number;
  coverage: boolean;
  redundancy_rate: number;
  latency_to_first_relevant: number | null;
}

export interface EvalResult {
  timeline_id: string;
  timeline_name: string;
  scenario: string;
  expected_labels: ExpectedLabel[];
  checkpoints: CheckpointResult[];
  metrics: TimelineMetrics;
  explainability_stats?: ExplainabilityStats;
  evaluated_at: string;
}

export interface VariantCheckpointResult {
  variant: string;
  timestamp: string;
  generated: Recommendation[];
  relevant_count: number;
  precision_at_3: number;
}

export interface VariantMetrics {
  variant: string;
  precision_at_3_avg: number;
  coverage: boolean;
  redundancy_rate: number;
  latency_to_first_relevant: number | null;
}

export interface VariantEvalResult {
  timeline_id: string;
  timeline_name: string;
  scenario: string;
  expected_labels: ExpectedLabel[];
  variants: {
    [variant: string]: {
      checkpoints: CheckpointResult[];
      metrics: TimelineMetrics;
      explainability_stats?: ExplainabilityStats;
    };
  };
  comparison?: VariantComparison;
  evaluated_at: string;
}

export interface VariantComparison {
  baseline: string;
  deltas: {
    [variant: string]: {
      delta_precision: number;
      delta_coverage: number;
      delta_latency: number | null;
    };
  };
  cross_source_gain_rate: number;
}

export interface RunOptions {
  runAll: boolean;
  specificTimeline: string | null;
  verbose: boolean;
  variants: RecommendationVariant[];
  compareMode: boolean;
  limit: number;
}

export interface CompareSummary {
  evaluated_at: string;
  total_timelines: number;
  variants: string[];
  variant_metrics: {
    [variant: string]: {
      avg_precision: number;
      coverage_rate: number;
      avg_redundancy: number;
    };
  };
  avg_deltas: {
    [variant: string]: {
      avg_delta_precision: number;
      avg_delta_coverage: number;
    };
  };
  cross_source: {
    avg_gain_rate: number;
    high_gain_scenarios: string[];
    low_gain_scenarios: string[];
  };
  results: Array<{
    timeline_id: string;
    scenario: string;
    variant_precisions: { [variant: string]: number };
    cross_source_gain: number;
  }>;
}
