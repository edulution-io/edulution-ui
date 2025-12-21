/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES, createStateEvidence } from '@edulution/events';
import type { ExplainabilityEvidence } from '@edulution/events';
import BaseRule from '../base.rule';
import type { RuleContext, RuleResult } from '../rule.interface';

const STALE_THREAD_DAYS = 7;
const VERY_STALE_DAYS = 14;

class StaleThreadsRule extends BaseRule {
  readonly id = 'reco.cleanup.stale_threads';

  readonly name = 'Stale Thread Detection';

  readonly class = RECOMMENDATION_CLASSES.CLEANUP;

  readonly priority = 40;

  readonly sources = ['mail'];

  readonly usesCorrelation = false;

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    const { user_id: userId, communications, timestamp } = context;
    const staleThreads: Array<{ thread_id: string; days_stale: number }> = [];

    communications.open_threads.forEach((thread) => {
      const daysSince = BaseRule.daysSince(thread.last_activity, timestamp);
      if (daysSince >= STALE_THREAD_DAYS) {
        staleThreads.push({
          thread_id: thread.thread_id,
          days_stale: Math.floor(daysSince),
        });
      }
    });

    if (staleThreads.length === 0) {
      return [];
    }

    const veryStaleCount = staleThreads.filter((t) => t.days_stale >= VERY_STALE_DAYS).length;
    const score = Math.min(0.8, 0.5 + staleThreads.length * 0.05 + veryStaleCount * 0.1);

    const threadEvidence: ExplainabilityEvidence[] = staleThreads.slice(0, 3).map((t) => ({
      kind: 'event' as const,
      label: 'Stale thread',
      refs: [{ ref_type: 'object_ref' as const, ref: t.thread_id, source: 'mail' }],
      meta: { days_stale: t.days_stale },
      sensitivity: 'low' as const,
    }));

    const evidenceItems = [
      createStateEvidence(
        'Stale threads count',
        `state:communications:${userId}:stale`,
        'mail',
        'today',
        { stale_count: staleThreads.length, very_stale_count: veryStaleCount },
      ),
      ...threadEvidence,
    ];

    return [
      this.createResult({
        class: this.class,
        title: 'Clean up stale threads',
        rationale: 'Several threads have been inactive for over a week.',
        score,
        evidenceItems,
        evidence: staleThreads.slice(0, 5).map((t) => ({
          kind: 'stale_thread',
          ref: t.thread_id,
          meta: { days_stale: t.days_stale },
        })),
        tags: veryStaleCount > 0 ? ['stale', 'very-stale'] : ['stale'],
      }),
    ];
  }
}

export default StaleThreadsRule;
