/*
 * LICENSE PLACEHOLDER
 */

import type { PriorityItem } from '../schemas/daily-plan.schema';

interface DedupResult {
  priorities: PriorityItem[];
  mergedCount: number;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function similarity(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/).filter((w) => w.length > 0));
  const wordsB = new Set(b.split(/\s+/).filter((w) => w.length > 0));
  if (wordsA.size === 0 || wordsB.size === 0) {
    return 0;
  }
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
}

/**
 * Deduplicate priorities by recommendation class.
 * Merges priorities with the same class, keeping the higher-ranked one
 * and combining their linked_candidate_ids.
 */
function deduplicatePriorities(
  priorities: PriorityItem[],
  candidateClassMap: Map<string, string>,
): DedupResult {
  const seen = new Map<string, PriorityItem>();
  const result: PriorityItem[] = [];
  let mergedCount = 0;

  for (const priority of priorities) {
    const classes = priority.linked_candidate_ids
      .map((id) => candidateClassMap.get(id))
      .filter(Boolean) as string[];

    const primaryClass = classes[0] || 'unknown';

    const existing = seen.get(primaryClass);

    if (existing) {
      const mergedIds = [...new Set([...existing.linked_candidate_ids, ...priority.linked_candidate_ids])];
      existing.linked_candidate_ids = mergedIds;
      mergedCount++;
    } else {
      const priorityCopy = { ...priority, linked_candidate_ids: [...priority.linked_candidate_ids] };
      seen.set(primaryClass, priorityCopy);
      result.push(priorityCopy);
    }
  }

  result.forEach((p, i) => {
    p.rank = i + 1;
  });

  return { priorities: result, mergedCount };
}

/**
 * Deduplicate priorities by similar titles using Jaccard similarity.
 * Merges priorities with similar titles (> 0.7 similarity), keeping
 * the higher-ranked one and combining their linked_candidate_ids.
 */
function deduplicateByTitle(priorities: PriorityItem[], threshold = 0.7): DedupResult {
  const result: PriorityItem[] = [];
  let mergedCount = 0;

  for (const priority of priorities) {
    const normalizedTitle = normalizeTitle(priority.title);

    const similar = result.find((p) => similarity(normalizeTitle(p.title), normalizedTitle) > threshold);

    if (similar) {
      similar.linked_candidate_ids = [...new Set([...similar.linked_candidate_ids, ...priority.linked_candidate_ids])];
      mergedCount++;
    } else {
      result.push({ ...priority, linked_candidate_ids: [...priority.linked_candidate_ids] });
    }
  }

  result.forEach((p, i) => {
    p.rank = i + 1;
  });

  return { priorities: result, mergedCount };
}

export { deduplicatePriorities, deduplicateByTitle, normalizeTitle, similarity };
export type { DedupResult };
