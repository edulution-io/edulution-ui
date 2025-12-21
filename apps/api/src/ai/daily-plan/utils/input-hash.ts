/*
 * LICENSE PLACEHOLDER
 */

import * as crypto from 'crypto';
import type { DailySummary, RecommendationOutboxItem } from '@edulution/events';
import type { SummarySnapshot, CandidateSnapshot } from '../schemas/input-snapshot.schema';

interface HashableInputs {
  userId: string;
  date: string;
  activityLevel: string;
  eventCountBucket: string;
  topEventTypes: string[];
  threadsAwaitingReply: number;
  meetingsNext24h: number;
  nextMeetingHour: string | null;
  candidateFingerprints: string[];
}

function bucket(n: number): string {
  if (n === 0) return '0';
  if (n <= 5) return '1-5';
  if (n <= 10) return '6-10';
  if (n <= 20) return '11-20';
  return '20+';
}

function roundToHour(isoDate: string | undefined | null): string | null {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return null;
  d.setMinutes(0, 0, 0);
  return d.toISOString().slice(0, 16);
}

function scoreBucket(score: number): string {
  return (Math.round(score * 10) / 10).toFixed(1);
}

function candidateFingerprint(c: CandidateSnapshot): string {
  return `${c.class}:${c.title}:${scoreBucket(c.score)}:${c.has_action_proposal}`;
}

function extractHashableInputs(
  userId: string,
  date: string,
  summary: SummarySnapshot,
  candidates: CandidateSnapshot[],
): HashableInputs {
  const topEventTypes = (summary.top_event_types || [])
    .map((e) => e.type)
    .sort();

  const candidateFingerprints = candidates
    .map(candidateFingerprint)
    .sort();

  return {
    userId,
    date,
    activityLevel: summary.activity_level || 'none',
    eventCountBucket: bucket(summary.total_events),
    topEventTypes,
    threadsAwaitingReply: summary.communications?.threads_awaiting_reply || 0,
    meetingsNext24h: summary.meetings?.upcoming_24h || 0,
    nextMeetingHour: roundToHour(summary.meetings?.next_meeting_at),
    candidateFingerprints,
  };
}

function generateInputHash(inputs: HashableInputs): string {
  const keys = Object.keys(inputs).sort() as (keyof HashableInputs)[];
  const normalized = keys.reduce<Record<string, unknown>>((acc, key) => {
    acc[key] = inputs[key];
    return acc;
  }, {});
  const json = JSON.stringify(normalized);

  const hash = crypto
    .createHash('sha256')
    .update(json)
    .digest('hex')
    .slice(0, 16);

  return hash;
}

function computeInputHash(
  userId: string,
  date: string,
  summary: SummarySnapshot,
  candidates: CandidateSnapshot[],
): string {
  const inputs = extractHashableInputs(userId, date, summary, candidates);
  return generateInputHash(inputs);
}

function createCandidateSnapshots(candidates: RecommendationOutboxItem[]): CandidateSnapshot[] {
  return candidates.map((c) => ({
    candidate_id: c.candidate_id,
    class: c.class,
    title: c.title,
    score: c.score || 0,
    dedup_key: c.dedup_key,
    has_action_proposal: !!c.action_proposal,
  }));
}

function createSummarySnapshot(summary: DailySummary): SummarySnapshot {
  return {
    activity_level: summary.activity_level,
    total_events: summary.total_events || 0,
    top_event_types: (summary.top_event_types || []).slice(0, 5).map((e) => ({
      type: e.type,
      count: e.count,
    })),
    communications: summary.communications ? {
      threads_awaiting_reply: summary.communications.threads_awaiting_reply || 0,
      messages_sent: summary.communications.messages_sent || 0,
      messages_received: summary.communications.messages_received || 0,
    } : undefined,
    meetings: summary.meetings ? {
      upcoming_24h: summary.meetings.upcoming_24h || 0,
      next_meeting_at: summary.meetings.meetings?.[0]?.scheduled_at,
    } : undefined,
  };
}

export {
  extractHashableInputs,
  generateInputHash,
  computeInputHash,
  createCandidateSnapshots,
  createSummarySnapshot,
  bucket,
  roundToHour,
  scoreBucket,
};

export type { HashableInputs };
