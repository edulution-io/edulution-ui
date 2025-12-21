/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES, createStateEvidence, createCorrelationEvidence } from '@edulution/events';
import BaseRule from '../base.rule';
import type { RuleContext, RuleResult } from '../rule.interface';

class LowActivityRule extends BaseRule {
  readonly id = 'reco.focus.low_activity';

  readonly name = 'Low Activity Detection';

  readonly class = RECOMMENDATION_CLASSES.FOCUS;

  readonly priority = 30;

  readonly sources = ['signals', 'mail'];

  readonly usesCorrelation = true;

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    const { user_id: userId, signals, communications } = context;

    if (signals.activity_level !== 'low' && signals.activity_level !== 'none') {
      return [];
    }

    if (communications.awaiting_reply.length === 0) {
      return [];
    }

    const evidenceItems = [
      createStateEvidence(
        'Low activity period',
        `state:user:${userId}:signals`,
        'signals',
        '1h',
        { activity_level: signals.activity_level },
      ),
      createCorrelationEvidence(
        'Pending items available',
        'low-activity-pending-correlation',
        { pending_count: communications.awaiting_reply.length },
      ),
    ];

    return [
      this.createResult({
        class: this.class,
        title: 'Good time to catch up',
        rationale: 'Low activity period - good opportunity to address pending items.',
        score: 0.6,
        evidenceItems,
        evidence: [
          {
            kind: 'activity_signal',
            ref: 'low-activity-pending-items',
            meta: {
              activity_level: signals.activity_level,
              pending_count: communications.awaiting_reply.length,
            },
          },
        ],
        tags: ['catch-up', 'low-activity'],
      }),
    ];
  }
}

export default LowActivityRule;
