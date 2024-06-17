import Attendee from '@libs/users-attendees/types/attendee';

interface FormData {
  name: string;
  password?: string;
  invitedAttendees: Attendee[];
}

export default FormData;
