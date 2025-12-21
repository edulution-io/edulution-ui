/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES, createStateEvidence, createCorrelationEvidence } from '@edulution/events';
import BaseRule from '../base.rule';
import type { RuleContext, RuleResult } from '../rule.interface';

class InboxZeroRule extends BaseRule {
  readonly id = 'reco.cleanup.inbox_zero';

  readonly name = 'Inbox Zero Opportunity';

  readonly class = RECOMMENDATION_CLASSES.CLEANUP;

  readonly priority = 25;

  readonly sources = ['mail', 'signals'];

  readonly usesCorrelation = true;

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    const { user_id: userId, communications, signals } = context;
    const { open_threads: openThreads, awaiting_reply: awaitingReply } = communications;

    if (awaitingReply.length > 3 || openThreads.length > 5) {
      return [];
    }

    if (awaitingReply.length === 0 && openThreads.length === 0) {
      return [];
    }

    if (signals.activity_level === 'high') {
      return [];
    }

    const evidenceItems = [
      createStateEvidence(
        'Inbox state',
        `state:communications:${userId}:inbox`,
        'mail',
        'today',
        { awaiting: awaitingReply.length, open: openThreads.length },
      ),
      createCorrelationEvidence(
        'Near inbox zero',
        'inbox-zero-opportunity',
        { activity_level: signals.activity_level, is_achievable: true },
      ),
    ];

    return [
      this.createResult({
        class: this.class,
        title: 'Achieve inbox zero',
        rationale: 'Few pending items remaining - close to inbox zero.',
        score: 0.55,
        evidenceItems,
        evidence: [
          {
            kind: 'inbox_state',
            ref: 'near-inbox-zero',
            meta: {
              awaiting: awaitingReply.length,
              open: openThreads.length,
            },
          },
        ],
        tags: ['inbox-zero', 'quick-win'],
      }),
    ];
  }
}

export default InboxZeroRule;
