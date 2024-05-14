import Attendee from '@/pages/ConferencePage/dto/attendee';

interface FormData {
  name: string;
  isPublic: string;
  password?: string;
  invitedAttendees: Attendee[];
}

export default FormData;
