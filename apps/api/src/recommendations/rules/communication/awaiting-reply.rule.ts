/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES, createStateEvidence } from '@edulution/events';
import BaseRule from '../base.rule';
import type { RuleContext, RuleResult } from '../rule.interface';

const STALE_THREAD_DAYS = 3;
const HIGH_PRIORITY_DAYS = 5;
const BASE_SCORE = 0.6;
const STALE_BONUS = 0.2;
const HIGH_PRIORITY_BONUS = 0.15;

class AwaitingReplyRule extends BaseRule {
  readonly id = 'reco.comm.awaiting_reply';

  readonly name = 'Awaiting Reply Detection';

  readonly class = RECOMMENDATION_CLASSES.COMMUNICATION;

  readonly priority = 80;

  readonly sources = ['mail'];

  readonly usesCorrelation = false;

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    const { user_id: userId, communications, timestamp } = context;
    const results: RuleResult[] = [];

    communications.awaiting_reply.forEach((threadId) => {
      const thread = communications.open_threads.find((t) => t.thread_id === threadId);
      const lastActivity = thread?.last_activity ?? timestamp;
      const daysSinceActivity = BaseRule.daysSince(lastActivity, timestamp);

      let score = BASE_SCORE;
      let rationale = 'A conversation is awaiting your response.';
      let isHighPriority = false;

      if (daysSinceActivity >= HIGH_PRIORITY_DAYS) {
        score += HIGH_PRIORITY_BONUS + STALE_BONUS;
        rationale = 'A conversation has been waiting for your response for several days.';
        isHighPriority = true;
      } else if (daysSinceActivity >= STALE_THREAD_DAYS) {
        score += STALE_BONUS;
        rationale = 'A conversation is awaiting your response.';
      }

      const evidenceItems = [
        createStateEvidence(
          'Thread awaiting reply',
          `state:communications:${userId}:awaiting`,
          'mail',
          'today',
          { thread_count: communications.awaiting_reply.length },
        ),
        {
          kind: 'event' as const,
          label: 'Last thread activity',
          refs: [
            {
              ref_type: 'object_ref' as const,
              ref: threadId,
              source: 'mail',
              occurred_at: new Date(lastActivity).toISOString(),
            },
          ],
          meta: { is_stale: daysSinceActivity >= STALE_THREAD_DAYS },
          sensitivity: 'low' as const,
        },
      ];

      results.push(
        this.createResult({
          class: this.class,
          title: 'Follow up on pending conversation',
          rationale,
          score,
          evidenceItems,
          evidence: [
            {
              kind: 'mail_thread',
              ref: threadId,
              ts: new Date(lastActivity).toISOString(),
              meta: { is_high_priority: isHighPriority },
            },
          ],
          context_id: threadId,
          tags: isHighPriority ? ['high-priority', 'stale'] : ['pending'],
          metadata: {
            waiting_since: new Date(lastActivity).toISOString(),
          },
        }),
      );
    });

    return results;
  }
}

export default AwaitingReplyRule;
