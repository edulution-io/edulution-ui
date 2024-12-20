import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

class CreateConferenceDto {
  name: string;

  password?: string;

  invitedAttendees: AttendeeDto[];

  invitedGroups: MultipleSelectorGroup[];

  isPublic: boolean;
}

export default CreateConferenceDto;
