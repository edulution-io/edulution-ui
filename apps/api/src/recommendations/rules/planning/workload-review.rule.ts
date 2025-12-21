/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES, createStateEvidence, createCorrelationEvidence } from '@edulution/events';
import BaseRule from '../base.rule';
import type { RuleContext, RuleResult } from '../rule.interface';

const HIGH_THREAD_COUNT = 10;
const VERY_HIGH_THREAD_COUNT = 20;

class WorkloadReviewRule extends BaseRule {
  readonly id = 'reco.planning.workload_review';

  readonly name = 'Workload Review';

  readonly class = RECOMMENDATION_CLASSES.PLANNING;

  readonly priority = 55;

  readonly sources = ['mail', 'caldav', 'signals'];

  readonly usesCorrelation = true;

  evaluate(context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    const { user_id: userId, communications, upcoming_meetings: upcomingMeetings, signals } = context;
    const openThreads = communications.open_threads.length;
    const meetingCount = upcomingMeetings.length;

    const threshold = this.getThreshold('thread_count', HIGH_THREAD_COUNT);

    if (openThreads < threshold && meetingCount < 3) {
      return [];
    }

    const isOverloaded = openThreads >= VERY_HIGH_THREAD_COUNT || meetingCount >= 5;
    const score = isOverloaded ? 0.85 : 0.65;

    const evidenceItems = [
      createStateEvidence(
        'Open threads',
        `state:communications:${userId}:threads`,
        'mail',
        'today',
        { open_threads: openThreads },
      ),
      createStateEvidence(
        'Upcoming meetings',
        `state:calendar:${userId}:upcoming`,
        'caldav',
        '24h',
        { meeting_count: meetingCount },
      ),
      createCorrelationEvidence(
        'High workload pattern',
        'workload-correlation',
        { is_overloaded: isOverloaded, activity_level: signals.activity_level },
      ),
    ];

    return [
      this.createResult({
        class: this.class,
        title: 'Review and prioritize workload',
        rationale: 'High volume of open threads and upcoming meetings - consider prioritization.',
        score,
        evidenceItems,
        evidence: [
          {
            kind: 'workload_signal',
            ref: 'high-workload',
            meta: {
              open_threads: openThreads,
              meetings: meetingCount,
              activity_level: signals.activity_level,
            },
          },
        ],
        tags: isOverloaded ? ['overloaded', 'urgent'] : ['busy', 'planning'],
      }),
    ];
  }
}

export default WorkloadReviewRule;
