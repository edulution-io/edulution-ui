import AttendeeDto from '@libs/conferences/types/attendee.dto';

class Conference {
  name: string;

  meetingID: string;

  creator: AttendeeDto;

  password?: string;

  isRunning: boolean;

  invitedAttendees: AttendeeDto[];

  joinedAttendees: AttendeeDto[];
}

export default Conference;
