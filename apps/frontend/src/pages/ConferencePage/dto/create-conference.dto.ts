import Attendee from '@libs/users-attendees/types/attendee';

class CreateConferenceDto {
  name: string;

  password?: string;

  invitedAttendees: Attendee[];
}

export default CreateConferenceDto;
