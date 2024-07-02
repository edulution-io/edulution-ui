import Attendee from '@libs/conferences/types/attendee';
import MultipleSelectorGroup from '@libs/user/types/groups/multipleSelectorGroup';

interface ConferencesForm {
  name: string;
  password?: string;
  invitedAttendees: Attendee[];
  invitedGroups: MultipleSelectorGroup[];
}

export default ConferencesForm;
