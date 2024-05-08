import Attendee from './bbb-attendee.dto';

export default class CreateBbbMeetingDto {
  meetingName: string;

  meetingID: string;

  internalMeetingID: string;

  createTime: string;

  createDate: string;

  voiceBridge: string;

  dialNumber: string;

  attendeePW: string;

  moderatorPW: string;

  metadata: Record<string, string>;

  // The parameters below are all number strings: "0" or "123141"
  duration: string;

  startTime: string;

  endTime: string;

  participantCount: string;

  listenerCount: string;

  voiceParticipantCount: string;

  videoCount: string;

  maxUsers: string;

  moderatorCount: string;

  // The parameters below are all boolean strings: "true" or "false"
  running: string;

  recording: string;

  hasBeenForciblyEnded: string;

  hasUserJoined: string;

  isBreakout: string;

  attendees: { attendee: Attendee | Attendee[] };
}
