/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES, createStateEvidence } from '@edulution/events';
import BaseRule from '../base.rule';
import type { RuleContext, RuleResult } from '../rule.interface';

const HIGH_ACTIVITY_THRESHOLD = 50;

class BreakSuggestionRule extends BaseRule {
  readonly id = 'reco.focus.break_needed';

  readonly name = 'Break Suggestion';

  readonly class = RECOMMENDATION_CLASSES.FOCUS;

  readonly priority = 40;

  readonly sources = ['signals'];

  readonly usesCorrelation = false;

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    const { user_id: userId, counts_1h: counts1h } = context;
    const totalEvents = Object.values(counts1h).reduce((sum, count) => sum + count, 0);

    if (totalEvents < HIGH_ACTIVITY_THRESHOLD) {
      return [];
    }

    const score = Math.min(0.8, 0.5 + (totalEvents - HIGH_ACTIVITY_THRESHOLD) * 0.01);

    const evidenceItems = [
      createStateEvidence(
        'Sustained high activity',
        `state:user:${userId}:counts`,
        'signals',
        '1h',
        { events_1h: totalEvents, threshold: HIGH_ACTIVITY_THRESHOLD },
      ),
    ];

    return [
      this.createResult({
        class: this.class,
        title: 'Consider taking a break',
        rationale: 'Sustained high activity detected - a short break may improve focus.',
        score,
        evidenceItems,
        evidence: [
          {
            kind: 'activity_signal',
            ref: 'sustained-high-activity',
            meta: { events_1h: totalEvents },
          },
        ],
        tags: ['break', 'wellness'],
      }),
    ];
  }
}

export default BreakSuggestionRule;
