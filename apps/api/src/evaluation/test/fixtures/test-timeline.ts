/*
 * LICENSE PLACEHOLDER
 */

import { randomUUID } from 'crypto';
import type { Event } from '@edulution/events';
import type { GeneratedTimeline } from '../../timeline-generator';

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function createTestTimeline(): GeneratedTimeline {
  const baseTime = new Date('2025-12-20T08:00:00.000Z');
  const userId = `test-user-${randomUUID().slice(0, 8)}`;

  const events: Event[] = [
    {
      event_id: randomUUID(),
      schema_version: '1.0.0',
      source: 'mail',
      type: 'mail.received',
      user_id: userId,
      object: { object_type: 'message', object_id: 'msg-1' },
      occurred_at: addHours(baseTime, 1).toISOString(),
      received_at: addHours(baseTime, 1).toISOString(),
      context: { thread_id: 'thread-1' },
      metadata: { subject_length: 20, has_attachments: false },
      sensitivity: 'medium',
      correlation_id: randomUUID(),
    },
    {
      event_id: randomUUID(),
      schema_version: '1.0.0',
      source: 'mail',
      type: 'mail.received',
      user_id: userId,
      object: { object_type: 'message', object_id: 'msg-2' },
      occurred_at: addHours(baseTime, 2).toISOString(),
      received_at: addHours(baseTime, 2).toISOString(),
      context: { thread_id: 'thread-2' },
      metadata: { subject_length: 30, has_attachments: false },
      sensitivity: 'medium',
      correlation_id: randomUUID(),
    },
    {
      event_id: randomUUID(),
      schema_version: '1.0.0',
      source: 'caldav',
      type: 'calendar.event_created',
      user_id: userId,
      object: { object_type: 'calendar_event', object_id: 'meeting-1' },
      occurred_at: addHours(baseTime, 0.5).toISOString(),
      received_at: addHours(baseTime, 0.5).toISOString(),
      metadata: { scheduled_at: addHours(baseTime, 3).toISOString() },
      sensitivity: 'low',
      correlation_id: randomUUID(),
    },
    {
      event_id: randomUUID(),
      schema_version: '1.0.0',
      source: 'caldav',
      type: 'calendar.event_created',
      user_id: userId,
      object: { object_type: 'calendar_event', object_id: 'meeting-2' },
      occurred_at: addHours(baseTime, 0.5).toISOString(),
      received_at: addHours(baseTime, 0.5).toISOString(),
      metadata: { scheduled_at: addHours(baseTime, 5).toISOString() },
      sensitivity: 'low',
      correlation_id: randomUUID(),
    },
    {
      event_id: randomUUID(),
      schema_version: '1.0.0',
      source: 'caldav',
      type: 'calendar.event_created',
      user_id: userId,
      object: { object_type: 'calendar_event', object_id: 'meeting-3' },
      occurred_at: addHours(baseTime, 0.5).toISOString(),
      received_at: addHours(baseTime, 0.5).toISOString(),
      metadata: { scheduled_at: addHours(baseTime, 7).toISOString() },
      sensitivity: 'low',
      correlation_id: randomUUID(),
    },
    {
      event_id: randomUUID(),
      schema_version: '1.0.0',
      source: 'files',
      type: 'file.created',
      user_id: userId,
      object: { object_type: 'file', object_id: 'file-1' },
      occurred_at: addHours(baseTime, 1.5).toISOString(),
      received_at: addHours(baseTime, 1.5).toISOString(),
      metadata: { path: '/docs/test.pdf', size: 1024 },
      sensitivity: 'low',
      correlation_id: randomUUID(),
    },
    {
      event_id: randomUUID(),
      schema_version: '1.0.0',
      source: 'files',
      type: 'file.uploaded',
      user_id: userId,
      object: { object_type: 'file', object_id: 'file-2' },
      occurred_at: addHours(baseTime, 2.5).toISOString(),
      received_at: addHours(baseTime, 2.5).toISOString(),
      metadata: { path: '/docs/notes.md', size: 512 },
      sensitivity: 'low',
      correlation_id: randomUUID(),
    },
  ];

  return {
    timeline_id: 'test_ablation_timeline',
    name: 'Ablation Test Timeline',
    description: 'Minimal timeline for ablation tests',
    user_id: userId,
    scenario: 'mixed',
    events,
    checkpoints: [addHours(baseTime, 2.5).toISOString()],
    expected_labels: [
      {
        class: 'meeting',
        rule_id: 'calendar:busy-day',
        window_start: addHours(baseTime, 0).toISOString(),
        window_end: addHours(baseTime, 10).toISOString(),
        rationale: '3 meetings scheduled',
      },
      {
        class: 'communication',
        rule_id: 'communication:awaiting-reply',
        window_start: addHours(baseTime, 0).toISOString(),
        window_end: addHours(baseTime, 10).toISOString(),
        rationale: '2 threads awaiting reply',
      },
    ],
  };
}

export default createTestTimeline;
