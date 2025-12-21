/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES, createEventEvidence } from '@edulution/events';
import BaseRule from '../base.rule';
import type { RuleContext, RuleResult } from '../rule.interface';

const PREP_WINDOW_MINUTES = 120;
const IMMINENT_WINDOW_MINUTES = 30;
const BASE_SCORE = 0.7;
const IMMINENT_BONUS = 0.2;

class MeetingPrepRule extends BaseRule {
  readonly id = 'reco.meeting.upcoming';

  readonly name = 'Meeting Preparation';

  readonly class = RECOMMENDATION_CLASSES.MEETING;

  readonly priority = 90;

  readonly sources = ['caldav'];

  readonly usesCorrelation = false;

  private static getTimeDescription(minutesUntil: number): string {
    if (minutesUntil < 60) {
      return 'Meeting starts soon.';
    }
    return 'Meeting scheduled within the next few hours.';
  }

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    const { upcoming_meetings: upcomingMeetings, timestamp } = context;
    const results: RuleResult[] = [];

    upcomingMeetings.forEach((meeting) => {
      const minutesUntil = BaseRule.minutesUntil(meeting.scheduled_at, timestamp);

      if (minutesUntil <= 0 || minutesUntil > PREP_WINDOW_MINUTES) {
        return;
      }

      const isImminent = minutesUntil <= IMMINENT_WINDOW_MINUTES;
      const score = isImminent ? BASE_SCORE + IMMINENT_BONUS : BASE_SCORE;
      const meetingTime = new Date(meeting.scheduled_at).toISOString();

      const evidenceItems = [
        createEventEvidence(
          'Upcoming meeting',
          meeting.meeting_id,
          'caldav',
          meetingTime,
          { is_imminent: isImminent },
        ),
      ];

      results.push(
        this.createResult({
          class: this.class,
          title: 'Prepare for upcoming meeting',
          rationale: MeetingPrepRule.getTimeDescription(minutesUntil),
          score,
          evidenceItems,
          evidence: [
            {
              kind: 'calendar_event',
              ref: meeting.meeting_id,
              ts: meetingTime,
              meta: { minutes_until: Math.floor(minutesUntil) },
            },
          ],
          context_id: meeting.meeting_id,
          tags: isImminent ? ['imminent', 'high-priority'] : ['upcoming'],
          metadata: {
            meeting_time: meetingTime,
          },
        }),
      );
    });

    return results;
  }
}

export default MeetingPrepRule;
