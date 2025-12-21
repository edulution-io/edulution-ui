/*
 * LICENSE PLACEHOLDER
 */

import type { RecommendationOutboxItem } from '@edulution/events';
import {
  extractHashableInputs,
  computeInputHash,
  createCandidateSnapshots,
  createSummarySnapshot,
  bucket,
  roundToHour,
  scoreBucket,
} from '../utils/input-hash';
import type { SummarySnapshot, CandidateSnapshot } from '../schemas/input-snapshot.schema';

describe('Input Hash', () => {
  const baseSummary: SummarySnapshot = {
    activity_level: 'medium',
    total_events: 15,
    top_event_types: [
      { type: 'mail.received', count: 10 },
      { type: 'calendar.event_created', count: 5 },
    ],
    communications: {
      threads_awaiting_reply: 3,
      messages_sent: 5,
      messages_received: 12,
    },
    meetings: {
      upcoming_24h: 2,
      next_meeting_at: '2025-12-21T14:30:00.000Z',
    },
  };

  const baseCandidates: CandidateSnapshot[] = [
    { candidate_id: 'c1', class: 'meeting', title: 'Prepare meeting', score: 0.85, has_action_proposal: false },
    { candidate_id: 'c2', class: 'communication', title: 'Reply to thread', score: 0.72, has_action_proposal: true },
  ];

  describe('bucket', () => {
    it('should return "0" for zero', () => {
      expect(bucket(0)).toBe('0');
    });

    it('should return "1-5" for values 1-5', () => {
      expect(bucket(1)).toBe('1-5');
      expect(bucket(5)).toBe('1-5');
    });

    it('should return "6-10" for values 6-10', () => {
      expect(bucket(6)).toBe('6-10');
      expect(bucket(10)).toBe('6-10');
    });

    it('should return "11-20" for values 11-20', () => {
      expect(bucket(11)).toBe('11-20');
      expect(bucket(20)).toBe('11-20');
    });

    it('should return "20+" for values above 20', () => {
      expect(bucket(21)).toBe('20+');
      expect(bucket(100)).toBe('20+');
    });
  });

  describe('roundToHour', () => {
    it('should round down to the hour', () => {
      expect(roundToHour('2025-12-21T14:30:00.000Z')).toBe('2025-12-21T14:00');
      expect(roundToHour('2025-12-21T14:59:59.999Z')).toBe('2025-12-21T14:00');
    });

    it('should return null for null/undefined', () => {
      expect(roundToHour(null)).toBeNull();
      expect(roundToHour(undefined)).toBeNull();
    });

    it('should return null for invalid date', () => {
      expect(roundToHour('not-a-date')).toBeNull();
    });

    it('should handle exact hour times', () => {
      expect(roundToHour('2025-12-21T14:00:00.000Z')).toBe('2025-12-21T14:00');
    });
  });

  describe('scoreBucket', () => {
    it('should round to one decimal place', () => {
      expect(scoreBucket(0.85)).toBe('0.9');
      expect(scoreBucket(0.84)).toBe('0.8');
      expect(scoreBucket(0.75)).toBe('0.8');
      expect(scoreBucket(0.74)).toBe('0.7');
    });

    it('should handle edge cases', () => {
      expect(scoreBucket(0)).toBe('0.0');
      expect(scoreBucket(1)).toBe('1.0');
      expect(scoreBucket(0.99)).toBe('1.0');
    });
  });

  describe('extractHashableInputs', () => {
    it('should extract all relevant fields', () => {
      const inputs = extractHashableInputs('user-1', '2025-12-21', baseSummary, baseCandidates);

      expect(inputs.userId).toBe('user-1');
      expect(inputs.date).toBe('2025-12-21');
      expect(inputs.activityLevel).toBe('medium');
      expect(inputs.eventCountBucket).toBe('11-20');
      expect(inputs.threadsAwaitingReply).toBe(3);
      expect(inputs.meetingsNext24h).toBe(2);
      expect(inputs.nextMeetingHour).toBe('2025-12-21T14:00');
    });

    it('should sort top event types', () => {
      const inputs = extractHashableInputs('user-1', '2025-12-21', baseSummary, baseCandidates);

      expect(inputs.topEventTypes).toEqual(['calendar.event_created', 'mail.received']);
    });

    it('should sort candidate fingerprints', () => {
      const inputs = extractHashableInputs('user-1', '2025-12-21', baseSummary, baseCandidates);

      expect(inputs.candidateFingerprints).toHaveLength(2);
      expect(inputs.candidateFingerprints[0]).toContain('communication');
      expect(inputs.candidateFingerprints[1]).toContain('meeting');
    });

    it('should handle missing optional fields', () => {
      const minimalSummary: SummarySnapshot = {
        activity_level: 'low',
        total_events: 0,
        top_event_types: [],
      };

      const inputs = extractHashableInputs('user-1', '2025-12-21', minimalSummary, []);

      expect(inputs.threadsAwaitingReply).toBe(0);
      expect(inputs.meetingsNext24h).toBe(0);
      expect(inputs.nextMeetingHour).toBeNull();
      expect(inputs.candidateFingerprints).toEqual([]);
    });
  });

  describe('generateInputHash', () => {
    it('should produce same hash for same inputs', () => {
      const hash1 = computeInputHash('user-1', '2025-12-21', baseSummary, baseCandidates);
      const hash2 = computeInputHash('user-1', '2025-12-21', baseSummary, baseCandidates);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different user', () => {
      const hash1 = computeInputHash('user-1', '2025-12-21', baseSummary, baseCandidates);
      const hash2 = computeInputHash('user-2', '2025-12-21', baseSummary, baseCandidates);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hash for different date', () => {
      const hash1 = computeInputHash('user-1', '2025-12-21', baseSummary, baseCandidates);
      const hash2 = computeInputHash('user-1', '2025-12-22', baseSummary, baseCandidates);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hash when activity level changes', () => {
      const hash1 = computeInputHash('user-1', '2025-12-21', baseSummary, baseCandidates);
      const hash2 = computeInputHash(
        'user-1',
        '2025-12-21',
        { ...baseSummary, activity_level: 'high' },
        baseCandidates,
      );

      expect(hash1).not.toBe(hash2);
    });

    it('should produce same hash regardless of candidate order', () => {
      const reversed = [...baseCandidates].reverse();

      const hash1 = computeInputHash('user-1', '2025-12-21', baseSummary, baseCandidates);
      const hash2 = computeInputHash('user-1', '2025-12-21', baseSummary, reversed);

      expect(hash1).toBe(hash2);
    });

    it('should produce same hash regardless of event type order', () => {
      const reorderedSummary: SummarySnapshot = {
        ...baseSummary,
        top_event_types: [...baseSummary.top_event_types].reverse(),
      };

      const hash1 = computeInputHash('user-1', '2025-12-21', baseSummary, baseCandidates);
      const hash2 = computeInputHash('user-1', '2025-12-21', reorderedSummary, baseCandidates);

      expect(hash1).toBe(hash2);
    });

    it('should be stable when meeting time changes within same hour', () => {
      const summary1: SummarySnapshot = {
        ...baseSummary,
        meetings: { ...baseSummary.meetings!, next_meeting_at: '2025-12-21T14:00:00.000Z' },
      };
      const summary2: SummarySnapshot = {
        ...baseSummary,
        meetings: { ...baseSummary.meetings!, next_meeting_at: '2025-12-21T14:45:00.000Z' },
      };

      const hash1 = computeInputHash('user-1', '2025-12-21', summary1, baseCandidates);
      const hash2 = computeInputHash('user-1', '2025-12-21', summary2, baseCandidates);

      expect(hash1).toBe(hash2);
    });

    it('should change when meeting hour changes', () => {
      const summary1: SummarySnapshot = {
        ...baseSummary,
        meetings: { ...baseSummary.meetings!, next_meeting_at: '2025-12-21T14:00:00.000Z' },
      };
      const summary2: SummarySnapshot = {
        ...baseSummary,
        meetings: { ...baseSummary.meetings!, next_meeting_at: '2025-12-21T15:00:00.000Z' },
      };

      const hash1 = computeInputHash('user-1', '2025-12-21', summary1, baseCandidates);
      const hash2 = computeInputHash('user-1', '2025-12-21', summary2, baseCandidates);

      expect(hash1).not.toBe(hash2);
    });

    it('should be stable when event count changes within bucket', () => {
      const summary1: SummarySnapshot = { ...baseSummary, total_events: 12 };
      const summary2: SummarySnapshot = { ...baseSummary, total_events: 18 };

      const hash1 = computeInputHash('user-1', '2025-12-21', summary1, baseCandidates);
      const hash2 = computeInputHash('user-1', '2025-12-21', summary2, baseCandidates);

      expect(hash1).toBe(hash2);
    });

    it('should change when event count crosses bucket boundary', () => {
      const summary1: SummarySnapshot = { ...baseSummary, total_events: 10 };
      const summary2: SummarySnapshot = { ...baseSummary, total_events: 11 };

      const hash1 = computeInputHash('user-1', '2025-12-21', summary1, baseCandidates);
      const hash2 = computeInputHash('user-1', '2025-12-21', summary2, baseCandidates);

      expect(hash1).not.toBe(hash2);
    });

    it('should change when score changes significantly', () => {
      const candidates1: CandidateSnapshot[] = [{ ...baseCandidates[0], score: 0.85 }];
      const candidates2: CandidateSnapshot[] = [{ ...baseCandidates[0], score: 0.95 }];

      const hash1 = computeInputHash('user-1', '2025-12-21', baseSummary, candidates1);
      const hash2 = computeInputHash('user-1', '2025-12-21', baseSummary, candidates2);

      expect(hash1).not.toBe(hash2);
    });

    it('should be stable when score changes within bucket', () => {
      const candidates1: CandidateSnapshot[] = [{ ...baseCandidates[0], score: 0.81 }];
      const candidates2: CandidateSnapshot[] = [{ ...baseCandidates[0], score: 0.84 }];

      const hash1 = computeInputHash('user-1', '2025-12-21', baseSummary, candidates1);
      const hash2 = computeInputHash('user-1', '2025-12-21', baseSummary, candidates2);

      expect(hash1).toBe(hash2);
    });

    it('should return 16 character hex string', () => {
      const hash = computeInputHash('user-1', '2025-12-21', baseSummary, baseCandidates);

      expect(hash).toMatch(/^[a-f0-9]{16}$/);
    });

    it('should change when candidate is added', () => {
      const moreCandidates = [
        ...baseCandidates,
        { candidate_id: 'c3', class: 'focus', title: 'Take a break', score: 0.5, has_action_proposal: false },
      ];

      const hash1 = computeInputHash('user-1', '2025-12-21', baseSummary, baseCandidates);
      const hash2 = computeInputHash('user-1', '2025-12-21', baseSummary, moreCandidates);

      expect(hash1).not.toBe(hash2);
    });

    it('should change when candidate has_action_proposal changes', () => {
      const candidates1: CandidateSnapshot[] = [{ ...baseCandidates[0], has_action_proposal: false }];
      const candidates2: CandidateSnapshot[] = [{ ...baseCandidates[0], has_action_proposal: true }];

      const hash1 = computeInputHash('user-1', '2025-12-21', baseSummary, candidates1);
      const hash2 = computeInputHash('user-1', '2025-12-21', baseSummary, candidates2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createCandidateSnapshots', () => {
    it('should extract stable fields only', () => {
      const fullCandidates: RecommendationOutboxItem[] = [
        {
          candidate_id: 'c1',
          class: 'meeting',
          title: 'Test',
          score: 0.85,
          created_at: new Date().toISOString(),
          dedup_key: 'dedup-1',
          rationale: 'Some rationale',
          sources_involved: ['files'],
          push_title: 'Push',
          push_content: 'Content',
          action_proposal: { action_type: 'navigate' },
        },
      ];

      const snapshots = createCandidateSnapshots(fullCandidates);

      expect(snapshots[0]).toEqual({
        candidate_id: 'c1',
        class: 'meeting',
        title: 'Test',
        score: 0.85,
        dedup_key: 'dedup-1',
        has_action_proposal: true,
      });
    });

    it('should handle candidates without action_proposal', () => {
      const fullCandidates: RecommendationOutboxItem[] = [
        {
          candidate_id: 'c1',
          class: 'meeting',
          title: 'Test',
          score: 0.85,
          created_at: new Date().toISOString(),
          dedup_key: 'dedup-1',
          rationale: 'Some rationale',
          sources_involved: ['files'],
          push_title: 'Push',
          push_content: 'Content',
        },
      ];

      const snapshots = createCandidateSnapshots(fullCandidates);

      expect(snapshots[0].has_action_proposal).toBe(false);
    });
  });

  describe('createSummarySnapshot', () => {
    it('should extract relevant fields from DailySummary', () => {
      const fullSummary = {
        user_id: 'user-1',
        date: '2025-12-21',
        activity_level: 'medium' as const,
        total_events: 25,
        by_source: [],
        communications: {
          threads_active: 5,
          threads_awaiting_reply: 3,
          messages_sent: 10,
          messages_received: 15,
        },
        meetings: {
          total_scheduled: 4,
          upcoming_24h: 2,
          meetings: [
            { meeting_id: 'm1', scheduled_at: '2025-12-21T14:00:00.000Z' },
          ],
        },
        top_event_types: [
          { type: 'mail.received', count: 10 },
          { type: 'file.created', count: 8 },
        ],
        generated_at: new Date().toISOString(),
      };

      const snapshot = createSummarySnapshot(fullSummary);

      expect(snapshot.activity_level).toBe('medium');
      expect(snapshot.total_events).toBe(25);
      expect(snapshot.top_event_types).toHaveLength(2);
      expect(snapshot.communications?.threads_awaiting_reply).toBe(3);
      expect(snapshot.meetings?.upcoming_24h).toBe(2);
      expect(snapshot.meetings?.next_meeting_at).toBe('2025-12-21T14:00:00.000Z');
    });

    it('should handle missing optional fields', () => {
      const minimalSummary = {
        user_id: 'user-1',
        date: '2025-12-21',
        activity_level: 'none' as const,
        total_events: 0,
        by_source: [],
        communications: {
          threads_active: 0,
          threads_awaiting_reply: 0,
          messages_sent: 0,
          messages_received: 0,
        },
        meetings: {
          total_scheduled: 0,
          upcoming_24h: 0,
          meetings: [],
        },
        top_event_types: [],
        generated_at: new Date().toISOString(),
      };

      const snapshot = createSummarySnapshot(minimalSummary);

      expect(snapshot.activity_level).toBe('none');
      expect(snapshot.total_events).toBe(0);
      expect(snapshot.meetings?.next_meeting_at).toBeUndefined();
    });

    it('should limit top_event_types to 5', () => {
      const summaryWithManyTypes = {
        user_id: 'user-1',
        date: '2025-12-21',
        activity_level: 'high' as const,
        total_events: 100,
        by_source: [],
        communications: {
          threads_active: 0,
          threads_awaiting_reply: 0,
          messages_sent: 0,
          messages_received: 0,
        },
        meetings: {
          total_scheduled: 0,
          upcoming_24h: 0,
          meetings: [],
        },
        top_event_types: [
          { type: 'type1', count: 10 },
          { type: 'type2', count: 9 },
          { type: 'type3', count: 8 },
          { type: 'type4', count: 7 },
          { type: 'type5', count: 6 },
          { type: 'type6', count: 5 },
          { type: 'type7', count: 4 },
        ],
        generated_at: new Date().toISOString(),
      };

      const snapshot = createSummarySnapshot(summaryWithManyTypes);

      expect(snapshot.top_event_types).toHaveLength(5);
    });
  });
});
