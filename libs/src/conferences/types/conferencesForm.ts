import AttendeeDto from '@libs/conferences/types/attendee.dto';
import MultipleSelectorGroup from '@libs/user/types/groups/multipleSelectorGroup';

interface ConferencesForm {
  name: string;
  password?: string;
  invitedAttendees: AttendeeDto[];
  invitedGroups: MultipleSelectorGroup[];
}

export default ConferencesForm;
