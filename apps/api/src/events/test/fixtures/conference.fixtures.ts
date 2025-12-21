/*
 * LICENSE PLACEHOLDER
 */

import {
  EventBuilder,
  EVENT_SOURCES,
  CONFERENCE_EVENT_TYPES,
  EVENT_SENSITIVITY,
} from '@edulution/events';
import type { Event } from '@edulution/events';

export interface ConferenceTimestamp {
  conferenceId: string;
  title: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  participantCount: number;
  hostUserId: string;
  participantUserIds: string[];
}

export const CONFERENCE_TIMESTAMPS: ConferenceTimestamp[] = [
  {
    conferenceId: 'conf-fixture-001',
    title: 'Daily Standup',
    scheduledStart: getRelativeTimestamp(1),
    scheduledEnd: getRelativeTimestamp(1, 15),
    participantCount: 5,
    hostUserId: 'user-host-1',
    participantUserIds: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
  {
    conferenceId: 'conf-fixture-002',
    title: 'Sprint Planning',
    scheduledStart: getRelativeTimestamp(4),
    scheduledEnd: getRelativeTimestamp(4, 120),
    participantCount: 8,
    hostUserId: 'user-host-1',
    participantUserIds: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6', 'user-7'],
  },
  {
    conferenceId: 'conf-fixture-003',
    title: 'One-on-One: Manager Sync',
    scheduledStart: getRelativeTimestamp(24),
    scheduledEnd: getRelativeTimestamp(24, 30),
    participantCount: 2,
    hostUserId: 'user-manager-1',
    participantUserIds: ['user-1'],
  },
  {
    conferenceId: 'conf-fixture-004',
    title: 'Client Demo',
    scheduledStart: getRelativeTimestamp(48),
    scheduledEnd: getRelativeTimestamp(48, 60),
    participantCount: 10,
    hostUserId: 'user-host-2',
    participantUserIds: ['user-1', 'user-2', 'user-3', 'user-external-1', 'user-external-2'],
  },
  {
    conferenceId: 'conf-fixture-005',
    title: 'Team Retrospective',
    scheduledStart: getRelativeTimestamp(72),
    scheduledEnd: getRelativeTimestamp(72, 90),
    participantCount: 6,
    hostUserId: 'user-host-1',
    participantUserIds: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
  },
];

export const PAST_CONFERENCE_TIMESTAMPS: ConferenceTimestamp[] = [
  {
    conferenceId: 'conf-past-001',
    title: 'Yesterday Standup',
    scheduledStart: getRelativeTimestamp(-24),
    scheduledEnd: getRelativeTimestamp(-24, 15),
    actualStart: getRelativeTimestamp(-24, 2),
    actualEnd: getRelativeTimestamp(-24, 18),
    participantCount: 4,
    hostUserId: 'user-host-1',
    participantUserIds: ['user-1', 'user-2', 'user-3'],
  },
  {
    conferenceId: 'conf-past-002',
    title: 'Last Week Planning',
    scheduledStart: getRelativeTimestamp(-168),
    scheduledEnd: getRelativeTimestamp(-168, 120),
    actualStart: getRelativeTimestamp(-168, 5),
    actualEnd: getRelativeTimestamp(-168, 135),
    participantCount: 7,
    hostUserId: 'user-host-1',
    participantUserIds: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6'],
  },
];

function getRelativeTimestamp(hoursFromNow: number, additionalMinutes: number = 0): string {
  const now = new Date();
  now.setHours(now.getHours() + hoursFromNow);
  now.setMinutes(now.getMinutes() + additionalMinutes);
  return now.toISOString();
}

export function createConferenceStartedEvent(
  timestamp: ConferenceTimestamp,
  userId: string,
): Event {
  return EventBuilder.create()
    .withUserId(userId)
    .withSource(EVENT_SOURCES.CONFERENCES)
    .withType(CONFERENCE_EVENT_TYPES.STARTED)
    .withOccurredAt(timestamp.actualStart || timestamp.scheduledStart)
    .withObject({
      object_type: 'meeting',
      object_id: timestamp.conferenceId,
      object_ref: timestamp.title,
    })
    .withMeetingId(timestamp.conferenceId)
    .withCorrelationId(`conf-corr-${timestamp.conferenceId}`)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('participant_count', timestamp.participantCount)
    .addMetadata('scheduled_start', timestamp.scheduledStart)
    .addMetadata('scheduled_end', timestamp.scheduledEnd)
    .addMetadata('host_user_id', timestamp.hostUserId)
    .build();
}

export function createConferenceEndedEvent(
  timestamp: ConferenceTimestamp,
  userId: string,
): Event {
  return EventBuilder.create()
    .withUserId(userId)
    .withSource(EVENT_SOURCES.CONFERENCES)
    .withType(CONFERENCE_EVENT_TYPES.ENDED)
    .withOccurredAt(timestamp.actualEnd || timestamp.scheduledEnd)
    .withObject({
      object_type: 'meeting',
      object_id: timestamp.conferenceId,
      object_ref: timestamp.title,
    })
    .withMeetingId(timestamp.conferenceId)
    .withCorrelationId(`conf-corr-${timestamp.conferenceId}`)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('participant_count', timestamp.participantCount)
    .addMetadata('duration_minutes', calculateDuration(timestamp))
    .build();
}

export function createParticipantJoinedEvent(
  timestamp: ConferenceTimestamp,
  userId: string,
  minutesAfterStart: number = 0,
): Event {
  const joinTime = new Date(timestamp.actualStart || timestamp.scheduledStart);
  joinTime.setMinutes(joinTime.getMinutes() + minutesAfterStart);

  return EventBuilder.create()
    .withUserId(userId)
    .withSource(EVENT_SOURCES.CONFERENCES)
    .withType(CONFERENCE_EVENT_TYPES.PARTICIPANT_JOINED)
    .withOccurredAt(joinTime.toISOString())
    .withObject({
      object_type: 'meeting',
      object_id: timestamp.conferenceId,
      object_ref: timestamp.title,
    })
    .withMeetingId(timestamp.conferenceId)
    .withCorrelationId(`conf-corr-${timestamp.conferenceId}`)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('is_host', userId === timestamp.hostUserId)
    .build();
}

export function createParticipantLeftEvent(
  timestamp: ConferenceTimestamp,
  userId: string,
  minutesBeforeEnd: number = 0,
): Event {
  const leaveTime = new Date(timestamp.actualEnd || timestamp.scheduledEnd);
  leaveTime.setMinutes(leaveTime.getMinutes() - minutesBeforeEnd);

  return EventBuilder.create()
    .withUserId(userId)
    .withSource(EVENT_SOURCES.CONFERENCES)
    .withType(CONFERENCE_EVENT_TYPES.PARTICIPANT_LEFT)
    .withOccurredAt(leaveTime.toISOString())
    .withObject({
      object_type: 'meeting',
      object_id: timestamp.conferenceId,
      object_ref: timestamp.title,
    })
    .withMeetingId(timestamp.conferenceId)
    .withCorrelationId(`conf-corr-${timestamp.conferenceId}`)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('is_host', userId === timestamp.hostUserId)
    .build();
}

function calculateDuration(timestamp: ConferenceTimestamp): number {
  const start = new Date(timestamp.actualStart || timestamp.scheduledStart);
  const end = new Date(timestamp.actualEnd || timestamp.scheduledEnd);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

export function generateConferenceEventsFromTimestamp(
  timestamp: ConferenceTimestamp,
): Event[] {
  const events: Event[] = [];

  events.push(createConferenceStartedEvent(timestamp, timestamp.hostUserId));

  events.push(createParticipantJoinedEvent(timestamp, timestamp.hostUserId, 0));

  for (let i = 0; i < timestamp.participantUserIds.length; i++) {
    const userId = timestamp.participantUserIds[i];
    const delay = Math.floor(Math.random() * 5);
    events.push(createParticipantJoinedEvent(timestamp, userId, delay));
  }

  for (let i = 0; i < timestamp.participantUserIds.length; i++) {
    const userId = timestamp.participantUserIds[i];
    const earlyLeave = Math.floor(Math.random() * 3);
    events.push(createParticipantLeftEvent(timestamp, userId, earlyLeave));
  }

  events.push(createParticipantLeftEvent(timestamp, timestamp.hostUserId, 0));

  events.push(createConferenceEndedEvent(timestamp, timestamp.hostUserId));

  return events;
}

export function getUpcomingConferenceTimestamps(withinHours: number = 24): ConferenceTimestamp[] {
  const now = Date.now();
  const cutoff = now + (withinHours * 60 * 60 * 1000);

  return CONFERENCE_TIMESTAMPS.filter((ts) => {
    const startTime = new Date(ts.scheduledStart).getTime();
    return startTime >= now && startTime <= cutoff;
  });
}

export function getPastConferenceTimestamps(withinHours: number = 24): ConferenceTimestamp[] {
  const now = Date.now();
  const cutoff = now - (withinHours * 60 * 60 * 1000);

  return [...CONFERENCE_TIMESTAMPS, ...PAST_CONFERENCE_TIMESTAMPS].filter((ts) => {
    const endTime = new Date(ts.actualEnd || ts.scheduledEnd).getTime();
    return endTime < now && endTime >= cutoff;
  });
}

export default {
  CONFERENCE_TIMESTAMPS,
  PAST_CONFERENCE_TIMESTAMPS,
  createConferenceStartedEvent,
  createConferenceEndedEvent,
  createParticipantJoinedEvent,
  createParticipantLeftEvent,
  generateConferenceEventsFromTimestamp,
  getUpcomingConferenceTimestamps,
  getPastConferenceTimestamps,
};
