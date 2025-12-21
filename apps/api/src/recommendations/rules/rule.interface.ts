/*
 * LICENSE PLACEHOLDER
 */

import type {
  RecommendationClass,
  UserSignals,
  UserCounts,
  UserLastSeen,
  Explainability,
} from '@edulution/events';

export interface OpenThread {
  thread_id: string;
  last_activity: number;
}

export interface UpcomingMeeting {
  meeting_id: string;
  scheduled_at: number;
}

export interface CommunicationsState {
  open_threads: OpenThread[];
  awaiting_reply: string[];
}

export interface RuleContext {
  user_id: string;
  timestamp: number;
  signals: UserSignals;
  last_seen: UserLastSeen;
  counts_1h: UserCounts;
  counts_24h: UserCounts;
  communications: CommunicationsState;
  upcoming_meetings: UpcomingMeeting[];
}

export interface RuleResult {
  rule_id: string;
  class: RecommendationClass;
  title: string;
  rationale: string;
  score: number;
  explainability: Explainability;
  context_id?: string;
  tags?: string[];
  /** @deprecated Use explainability.evidence instead */
  evidence: Array<{
    kind: string;
    ref: string;
    ts?: string;
    meta?: Record<string, unknown>;
  }>;
  metadata?: {
    meeting_time?: string;
    waiting_since?: string;
    [key: string]: unknown;
  };
}

export interface Rule {
  id: string;
  name: string;
  class: RecommendationClass;
  priority: number;
  sources: string[];
  usesCorrelation: boolean;
  evaluate(context: RuleContext): RuleResult[];
}

export interface RuleConfig {
  enabled: boolean;
  thresholds?: Record<string, number>;
}

export const DEFAULT_RULE_CONFIG: RuleConfig = {
  enabled: true,
};
