import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

class ConferenceDto {
  name: string;

  meetingID: string;

  creator: AttendeeDto;

  password?: string;

  isRunning: boolean;

  isPublic: boolean;

  invitedAttendees: AttendeeDto[];

  invitedGroups: MultipleSelectorGroup[];

  joinedAttendees: AttendeeDto[];
}

export default ConferenceDto;
