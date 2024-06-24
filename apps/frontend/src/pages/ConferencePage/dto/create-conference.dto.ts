import Attendee from '@/pages/ConferencePage/dto/attendee';

class CreateConferenceDto {
  name: string;

  password?: string;

  invitedAttendees: Attendee[];
}

export default CreateConferenceDto;
