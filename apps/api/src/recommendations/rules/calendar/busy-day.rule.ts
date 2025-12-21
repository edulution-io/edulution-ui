/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES, createStateEvidence, createCorrelationEvidence } from '@edulution/events';
import BaseRule from '../base.rule';
import type { RuleContext, RuleResult } from '../rule.interface';

class BusyDayRule extends BaseRule {
  readonly id = 'reco.meeting.busy_schedule';

  readonly name = 'Busy Day Detection';

  readonly class = RECOMMENDATION_CLASSES.MEETING;

  readonly priority = 50;

  readonly sources = ['caldav'];

  readonly usesCorrelation = false;

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    const threshold = this.getThreshold('meeting_count', 3);
    const { user_id: userId, upcoming_meetings: upcomingMeetings } = context;

    if (upcomingMeetings.length < threshold) {
      return [];
    }

    const score = Math.min(0.85, 0.5 + upcomingMeetings.length * 0.1);
    const firstMeetingTime = new Date(upcomingMeetings[0].scheduled_at).toISOString();

    const evidenceItems = [
      createStateEvidence(
        'Upcoming meetings',
        `state:calendar:${userId}:upcoming`,
        'caldav',
        '24h',
        { meeting_count: upcomingMeetings.length },
      ),
      createCorrelationEvidence(
        'Busy schedule pattern',
        'busy-schedule-correlation',
        { threshold_exceeded: true },
      ),
    ];

    return [
      this.createResult({
        class: this.class,
        title: 'Plan around busy schedule',
        rationale: 'Your schedule appears busy with multiple events today.',
        score,
        evidenceItems,
        evidence: [
          {
            kind: 'correlation',
            ref: 'busy-schedule',
            meta: {
              meeting_count: upcomingMeetings.length,
              first_meeting: firstMeetingTime,
            },
          },
        ],
        tags: ['busy-day', 'planning'],
        metadata: {
          meeting_time: firstMeetingTime,
        },
      }),
    ];
  }
}

export default BusyDayRule;
