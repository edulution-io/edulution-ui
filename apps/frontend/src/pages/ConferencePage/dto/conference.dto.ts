import Attendee from '@/pages/ConferencePage/dto/attendee';

export class Conference {
  name: string;

  meetingID: string;

  creator: Attendee;

  password?: string;

  isRunning: boolean;

  invitedAttendees: Attendee[];

  joinedAttendees: Attendee[];
}

export default Conference;