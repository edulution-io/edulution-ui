/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES, createStateEvidence, createCorrelationEvidence } from '@edulution/events';
import BaseRule from '../base.rule';
import type { RuleContext, RuleResult } from '../rule.interface';

class HighVolumeInboxRule extends BaseRule {
  readonly id = 'reco.comm.high_volume';

  readonly name = 'High Volume Inbox Detection';

  readonly class = RECOMMENDATION_CLASSES.COMMUNICATION;

  readonly priority = 60;

  readonly sources = ['mail'];

  readonly usesCorrelation = false;

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    const threshold = this.getThreshold('awaiting_count', 5);
    const { user_id: userId, communications } = context;

    if (communications.awaiting_reply.length < threshold) {
      return [];
    }

    const score = Math.min(0.9, 0.5 + communications.awaiting_reply.length * 0.05);

    const evidenceItems = [
      createStateEvidence(
        'Communication backlog',
        `state:communications:${userId}:backlog`,
        'mail',
        'today',
        { awaiting_count: communications.awaiting_reply.length },
      ),
      createCorrelationEvidence(
        'High volume pattern',
        'inbox-backlog-correlation',
        { threshold_exceeded: true, open_count: communications.open_threads.length },
      ),
    ];

    return [
      this.createResult({
        class: this.class,
        title: 'Review communication backlog',
        rationale: 'Multiple threads are awaiting your response.',
        score,
        evidenceItems,
        evidence: [
          {
            kind: 'correlation',
            ref: 'inbox-backlog',
            meta: {
              awaiting_count: communications.awaiting_reply.length,
              open_count: communications.open_threads.length,
            },
          },
        ],
        tags: ['backlog', 'bulk-action'],
      }),
    ];
  }
}

export default HighVolumeInboxRule;
