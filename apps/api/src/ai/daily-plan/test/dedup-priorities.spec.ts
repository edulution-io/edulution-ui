/*
 * LICENSE PLACEHOLDER
 */

import type { PriorityItem } from '../schemas/daily-plan.schema';
import {
  deduplicatePriorities,
  deduplicateByTitle,
  normalizeTitle,
  similarity,
} from '../utils/dedup-priorities';

describe('dedup-priorities', () => {
  describe('normalizeTitle', () => {
    it('should lowercase and remove punctuation', () => {
      expect(normalizeTitle('Check Emails!')).toBe('check emails');
    });

    it('should handle empty string', () => {
      expect(normalizeTitle('')).toBe('');
    });

    it('should preserve numbers', () => {
      expect(normalizeTitle('Review 5 items')).toBe('review 5 items');
    });
  });

  describe('similarity', () => {
    it('should return 1 for identical strings', () => {
      expect(similarity('check emails', 'check emails')).toBe(1);
    });

    it('should return 0 for completely different strings', () => {
      expect(similarity('alpha beta', 'gamma delta')).toBe(0);
    });

    it('should return partial score for overlapping words', () => {
      const score = similarity('check emails now', 'check messages now');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
    });

    it('should handle empty strings', () => {
      expect(similarity('', '')).toBe(0);
    });
  });

  describe('deduplicatePriorities', () => {
    it('should merge priorities with same class', () => {
      const priorities: PriorityItem[] = [
        { rank: 1, title: 'Check emails', why: 'Reason 1', linked_candidate_ids: ['comm-1'] },
        { rank: 2, title: 'Prepare meeting', why: 'Reason 2', linked_candidate_ids: ['meeting-1'] },
        { rank: 3, title: 'Review messages', why: 'Reason 3', linked_candidate_ids: ['comm-2'] },
      ];

      const classMap = new Map([
        ['comm-1', 'communication'],
        ['comm-2', 'communication'],
        ['meeting-1', 'meeting'],
      ]);

      const { priorities: result, mergedCount } = deduplicatePriorities(priorities, classMap);

      expect(result.length).toBe(2);
      expect(mergedCount).toBe(1);
      expect(result[0].linked_candidate_ids).toContain('comm-1');
      expect(result[0].linked_candidate_ids).toContain('comm-2');
      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(2);
    });

    it('should preserve all candidate IDs after merge', () => {
      const priorities: PriorityItem[] = [
        { rank: 1, title: 'A', why: 'W1', linked_candidate_ids: ['a', 'b'] },
        { rank: 2, title: 'B', why: 'W2', linked_candidate_ids: ['c'] },
      ];

      const classMap = new Map([
        ['a', 'comm'],
        ['b', 'comm'],
        ['c', 'comm'],
      ]);

      const { priorities: result } = deduplicatePriorities(priorities, classMap);

      expect(result.length).toBe(1);
      expect(result[0].linked_candidate_ids).toEqual(['a', 'b', 'c']);
    });

    it('should not merge priorities with different classes', () => {
      const priorities: PriorityItem[] = [
        { rank: 1, title: 'Task A', why: 'Why A', linked_candidate_ids: ['id-1'] },
        { rank: 2, title: 'Task B', why: 'Why B', linked_candidate_ids: ['id-2'] },
      ];

      const classMap = new Map([
        ['id-1', 'communication'],
        ['id-2', 'meeting'],
      ]);

      const { priorities: result, mergedCount } = deduplicatePriorities(priorities, classMap);

      expect(result.length).toBe(2);
      expect(mergedCount).toBe(0);
    });

    it('should handle priorities without class mapping', () => {
      const priorities: PriorityItem[] = [
        { rank: 1, title: 'Task A', why: 'Why A', linked_candidate_ids: ['unknown-1'] },
        { rank: 2, title: 'Task B', why: 'Why B', linked_candidate_ids: ['unknown-2'] },
      ];

      const classMap = new Map<string, string>();

      const { priorities: result, mergedCount } = deduplicatePriorities(priorities, classMap);

      expect(result.length).toBe(1);
      expect(mergedCount).toBe(1);
      expect(result[0].linked_candidate_ids).toContain('unknown-1');
      expect(result[0].linked_candidate_ids).toContain('unknown-2');
    });

    it('should re-number ranks after merge', () => {
      const priorities: PriorityItem[] = [
        { rank: 1, title: 'First', why: 'W1', linked_candidate_ids: ['a'] },
        { rank: 2, title: 'Second', why: 'W2', linked_candidate_ids: ['b'] },
        { rank: 3, title: 'Third', why: 'W3', linked_candidate_ids: ['c'] },
        { rank: 4, title: 'Fourth', why: 'W4', linked_candidate_ids: ['d'] },
      ];

      const classMap = new Map([
        ['a', 'class-a'],
        ['b', 'class-a'],
        ['c', 'class-c'],
        ['d', 'class-c'],
      ]);

      const { priorities: result } = deduplicatePriorities(priorities, classMap);

      expect(result.length).toBe(2);
      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(2);
    });

    it('should keep higher-ranked priority when merging', () => {
      const priorities: PriorityItem[] = [
        { rank: 1, title: 'First priority', why: 'First reason', linked_candidate_ids: ['a'] },
        { rank: 2, title: 'Second priority', why: 'Second reason', linked_candidate_ids: ['b'] },
      ];

      const classMap = new Map([
        ['a', 'same-class'],
        ['b', 'same-class'],
      ]);

      const { priorities: result } = deduplicatePriorities(priorities, classMap);

      expect(result.length).toBe(1);
      expect(result[0].title).toBe('First priority');
      expect(result[0].why).toBe('First reason');
    });

    it('should not mutate original priorities', () => {
      const priorities: PriorityItem[] = [
        { rank: 1, title: 'A', why: 'W1', linked_candidate_ids: ['a'] },
        { rank: 2, title: 'B', why: 'W2', linked_candidate_ids: ['b'] },
      ];

      const classMap = new Map([
        ['a', 'comm'],
        ['b', 'comm'],
      ]);

      deduplicatePriorities(priorities, classMap);

      expect(priorities[0].linked_candidate_ids).toEqual(['a']);
      expect(priorities[1].linked_candidate_ids).toEqual(['b']);
    });
  });

  describe('deduplicateByTitle', () => {
    it('should merge priorities with similar titles', () => {
      const priorities: PriorityItem[] = [
        { rank: 1, title: 'Check emails and messages', why: 'Reason 1', linked_candidate_ids: ['a'] },
        { rank: 2, title: 'Prepare for meeting', why: 'Reason 2', linked_candidate_ids: ['b'] },
        { rank: 3, title: 'Check messages and emails', why: 'Reason 3', linked_candidate_ids: ['c'] },
      ];

      const { priorities: result, mergedCount } = deduplicateByTitle(priorities);

      expect(result.length).toBe(2);
      expect(mergedCount).toBe(1);
    });

    it('should not merge priorities with different titles', () => {
      const priorities: PriorityItem[] = [
        { rank: 1, title: 'Check emails', why: 'Reason 1', linked_candidate_ids: ['a'] },
        { rank: 2, title: 'Prepare meeting', why: 'Reason 2', linked_candidate_ids: ['b'] },
        { rank: 3, title: 'Review documents', why: 'Reason 3', linked_candidate_ids: ['c'] },
      ];

      const { priorities: result, mergedCount } = deduplicateByTitle(priorities);

      expect(result.length).toBe(3);
      expect(mergedCount).toBe(0);
    });

    it('should combine candidate IDs when merging', () => {
      const priorities: PriorityItem[] = [
        { rank: 1, title: 'Check emails respond quickly', why: 'W1', linked_candidate_ids: ['a', 'b'] },
        { rank: 2, title: 'Check emails respond fast', why: 'W2', linked_candidate_ids: ['c'] },
      ];

      const { priorities: result } = deduplicateByTitle(priorities, 0.5);

      expect(result.length).toBe(1);
      expect(result[0].linked_candidate_ids).toEqual(['a', 'b', 'c']);
    });

    it('should use custom threshold', () => {
      const priorities: PriorityItem[] = [
        { rank: 1, title: 'Alpha beta', why: 'W1', linked_candidate_ids: ['a'] },
        { rank: 2, title: 'Alpha gamma', why: 'W2', linked_candidate_ids: ['b'] },
      ];

      const resultStrict = deduplicateByTitle(priorities, 0.9);
      expect(resultStrict.priorities.length).toBe(2);

      const resultLoose = deduplicateByTitle(priorities, 0.3);
      expect(resultLoose.priorities.length).toBe(1);
    });

    it('should re-number ranks after merge', () => {
      const priorities: PriorityItem[] = [
        { rank: 1, title: 'Check inbox', why: 'W1', linked_candidate_ids: ['a'] },
        { rank: 2, title: 'Different task', why: 'W2', linked_candidate_ids: ['b'] },
        { rank: 3, title: 'Check mailbox', why: 'W3', linked_candidate_ids: ['c'] },
      ];

      const { priorities: result } = deduplicateByTitle(priorities);

      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(2);
    });
  });
});
