/*
 * LICENSE PLACEHOLDER
 */

import type {
  ActionProposal,
  Explainability,
  RecommendationCandidate,
  RecommendationClass,
} from '@edulution/events';
import { generateSummary, generatePushText, type PushContext } from '../../templates';
import { calculateExpiresAt } from '../../config';
import { computeSourcesInvolved } from '../../utils';

export interface BaseEvent {
  event_id: string;
  action: string;
  source: string;
  object_id: string;
  occurred_at: string;
}

export function buildCrossAppCandidate(
  userId: string,
  ruleId: string,
  ruleVersion: string,
  event: BaseEvent,
  proposal: ActionProposal,
  dedupKey: string,
  opts: {
    class: RecommendationClass;
    title: string;
    rationale: string;
    pushContext?: PushContext;
  },
): RecommendationCandidate {
  const pushText = generatePushText(ruleId, opts.pushContext || {});
  const createdAt = new Date();
  const expiresAt = calculateExpiresAt(ruleId, createdAt);
  const explainability: Explainability = {
    rule_id: ruleId,
    rule_version: ruleVersion,
    summary: generateSummary(opts.rationale, ruleId, ruleVersion),
    evidence: [
      {
        kind: 'event',
        label: `Triggered by ${event.action}`,
        refs: [
          { ref_type: 'event_id', ref: event.event_id, source: event.source },
          { ref_type: 'object_ref', ref: event.object_id },
        ],
        meta: { action: event.action, source: event.source },
        sensitivity: 'low',
      },
      {
        kind: 'rule',
        label: 'Cross-app automation rule',
        refs: [{ ref_type: 'rule_id', ref: ruleId }],
        meta: {
          steps_count: proposal.steps.length,
          capabilities: proposal.steps.map((s) => s.capability).join(', '),
        },
        sensitivity: 'low',
      },
    ],
  };

  const scores = calculateScores(proposal);
  const sourcesInvolved = computeSourcesInvolved(explainability);

  return {
    candidate_id: proposal.proposal_id,
    dedup_key: dedupKey,
    user_id: userId,
    created_at: createdAt.toISOString(),
    expires_at: expiresAt,
    class: opts.class,
    title: opts.title,
    rationale: opts.rationale,
    scores,
    sources_involved: sourcesInvolved,
    context_id: event.object_id,
    explainability,
    evidence: [
      {
        kind: 'event',
        ref: event.event_id,
        meta: { action: event.action },
      },
    ],
    action_proposal: proposal,
    push_title: pushText.title,
    push_content: pushText.content,
  };
}

function calculateScores(proposal: ActionProposal): {
  confidence: number;
  impact: number;
  effort: number;
} {
  const impactMap = { low: 0.4, medium: 0.6, high: 0.8 };
  const effortMap = { low: 0.3, medium: 0.5, high: 0.7 };
  const confidenceMap = { full: 0.8, partial: 0.7, none: 0.6 };

  const impact = impactMap[proposal.estimated_impact];
  const effort = effortMap[proposal.estimated_impact];
  const confidence = confidenceMap[proposal.reversible];

  return { confidence, impact, effort };
}

export function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/[^a-zA-Z0-9\s_äöüÄÖÜß-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

export function getYear(dateStr?: string): string {
  try {
    return new Date(dateStr || Date.now()).getFullYear().toString();
  } catch {
    return new Date().getFullYear().toString();
  }
}
