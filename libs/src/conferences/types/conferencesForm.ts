import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

interface ConferencesForm {
  name: string;
  password?: string;
  invitedAttendees: AttendeeDto[];
  invitedGroups: MultipleSelectorGroup[];
}

export default ConferencesForm;
