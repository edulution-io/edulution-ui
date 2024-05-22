import BbbAttendeeDto from './bbb-attendee.dto';

export default class BbbResponseDto {
  response: {
    returncode: string;

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

    attendees: { attendee: BbbAttendeeDto | BbbAttendeeDto[] };

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
  };
}
