import Attendee from './attendee';

class CreateConferenceDto {
  name: string;

  password?: string;

  invitedAttendees: Attendee[];
}

export default CreateConferenceDto;
