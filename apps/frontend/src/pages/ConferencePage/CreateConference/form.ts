import Attendee from '@libs/conferences/types/attendee';

interface FormData {
  name: string;
  password?: string;
  invitedAttendees: Attendee[];
}

export default FormData;
