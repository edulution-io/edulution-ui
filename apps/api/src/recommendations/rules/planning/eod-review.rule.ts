/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES, createStateEvidence, createHeuristicEvidence } from '@edulution/events';
import BaseRule from '../base.rule';
import type { RuleContext, RuleResult } from '../rule.interface';

class EndOfDayReviewRule extends BaseRule {
  readonly id = 'reco.planning.end_of_day';

  readonly name = 'End of Day Review';

  readonly class = RECOMMENDATION_CLASSES.PLANNING;

  readonly priority = 45;

  readonly sources = ['signals', 'mail'];

  readonly usesCorrelation = true;

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    const { user_id: userId, timestamp, counts_24h: counts24h, communications } = context;
    const hour = new Date(timestamp).getHours();

    if (hour < 16 || hour > 18) {
      return [];
    }

    const totalEvents = Object.values(counts24h).reduce((sum, count) => sum + count, 0);

    if (totalEvents < 10) {
      return [];
    }

    const evidenceItems = [
      createStateEvidence(
        'Daily activity',
        `state:user:${userId}:counts`,
        'signals',
        '24h',
        { events_today: totalEvents },
      ),
      createHeuristicEvidence(
        'End of day time window',
        [{ ref_type: 'object_ref', ref: 'time-window', source: 'time' }],
        { hour, is_eod: true },
      ),
    ];

    return [
      this.createResult({
        class: this.class,
        title: 'Plan for tomorrow',
        rationale: 'End of day - good time to review accomplishments and plan next steps.',
        score: 0.6,
        evidenceItems,
        evidence: [
          {
            kind: 'time_signal',
            ref: 'end-of-day',
            meta: {
              hour,
              events_today: totalEvents,
              pending_threads: communications.awaiting_reply.length,
            },
          },
        ],
        tags: ['eod', 'planning', 'review'],
      }),
    ];
  }
}

export default EndOfDayReviewRule;
