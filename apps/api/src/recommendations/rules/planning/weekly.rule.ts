/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES, createHeuristicEvidence } from '@edulution/events';
import BaseRule from '../base.rule';
import type { RuleContext, RuleResult } from '../rule.interface';

class WeeklyPlanningRule extends BaseRule {
  readonly id = 'reco.planning.weekly';

  readonly name = 'Weekly Planning';

  readonly class = RECOMMENDATION_CLASSES.PLANNING;

  readonly priority = 35;

  readonly sources = ['time'];

  readonly usesCorrelation = false;

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    const { timestamp } = context;
    const dayOfWeek = new Date(timestamp).getDay();
    const hour = new Date(timestamp).getHours();

    const isMondayMorning = dayOfWeek === 1 && hour >= 8 && hour <= 10;
    const isFridayAfternoon = dayOfWeek === 5 && hour >= 15 && hour <= 17;

    if (!isMondayMorning && !isFridayAfternoon) {
      return [];
    }

    const title = isMondayMorning ? 'Plan your week' : 'Review your week';
    const rationale = isMondayMorning
      ? 'Monday morning - ideal time to set weekly priorities.'
      : 'Friday afternoon - good time to review progress and wrap up.';

    const evidenceItems = [
      createHeuristicEvidence(
        isMondayMorning ? 'Monday planning window' : 'Friday review window',
        [{ ref_type: 'object_ref', ref: 'weekly-time-window', source: 'time' }],
        { day: dayOfWeek, hour, is_planning: isMondayMorning },
      ),
    ];

    return [
      this.createResult({
        class: this.class,
        title,
        rationale,
        score: 0.55,
        evidenceItems,
        evidence: [
          {
            kind: 'time_signal',
            ref: isMondayMorning ? 'monday-planning' : 'friday-review',
            meta: { day: dayOfWeek, hour },
          },
        ],
        tags: ['weekly', isMondayMorning ? 'planning' : 'review'],
      }),
    ];
  }
}

export default WeeklyPlanningRule;
