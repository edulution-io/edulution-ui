/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES, createStateEvidence, createCorrelationEvidence } from '@edulution/events';
import BaseRule from '../base.rule';
import type { RuleContext, RuleResult } from '../rule.interface';

const FOCUS_WINDOW_MINUTES = 120;

class FocusTimeRule extends BaseRule {
  readonly id = 'reco.focus.deep_work';

  readonly name = 'Deep Work Opportunity';

  readonly class = RECOMMENDATION_CLASSES.FOCUS;

  readonly priority = 70;

  readonly sources = ['signals', 'caldav'];

  readonly usesCorrelation = true;

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    const { user_id: userId, signals, upcoming_meetings: upcomingMeetings, timestamp } = context;

    if (signals.activity_level !== 'high') {
      return [];
    }

    const hasUpcomingMeeting = upcomingMeetings.some((m) => {
      const minutesUntil = BaseRule.minutesUntil(m.scheduled_at, timestamp);
      return minutesUntil > 0 && minutesUntil < FOCUS_WINDOW_MINUTES;
    });

    if (hasUpcomingMeeting) {
      return [];
    }

    const evidenceItems = [
      createStateEvidence(
        'Activity level',
        `state:user:${userId}:signals`,
        'signals',
        '1h',
        { activity_level: signals.activity_level },
      ),
      createCorrelationEvidence(
        'Meeting-free window',
        'focus-opportunity-correlation',
        { meeting_free_minutes: FOCUS_WINDOW_MINUTES },
      ),
    ];

    return [
      this.createResult({
        class: this.class,
        title: 'Schedule focus time',
        rationale: 'High activity detected with no upcoming meetings - ideal for deep work.',
        score: 0.75,
        evidenceItems,
        evidence: [
          {
            kind: 'activity_signal',
            ref: 'high-activity-no-meetings',
            meta: {
              activity_level: signals.activity_level,
              upcoming_meetings: upcomingMeetings.length,
            },
          },
        ],
        tags: ['deep-work', 'productivity'],
      }),
    ];
  }
}

export default FocusTimeRule;
