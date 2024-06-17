import Attendee from '@libs/conferences/types/attendee';

class CreateConferenceDto {
  name: string;

  password?: string;

  invitedAttendees: Attendee[];
}

export default CreateConferenceDto;
