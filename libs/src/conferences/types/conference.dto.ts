import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

class Conference {
  name: string;

  meetingID: string;

  creator: AttendeeDto;

  password?: string;

  isRunning: boolean;

  invitedAttendees: AttendeeDto[];

  invitedGroups: MultipleSelectorGroup[];

  joinedAttendees: AttendeeDto[];
}

export default Conference;
