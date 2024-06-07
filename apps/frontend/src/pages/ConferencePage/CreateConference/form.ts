import Attendee from '@/pages/ConferencePage/dto/attendee';
import Group from '@/pages/ConferencePage/dto/group';

interface FormData {
  name: string;
  password?: string;
  invitedAttendees: Attendee[];
  invitedGroups: Group[];
}

export default FormData;
