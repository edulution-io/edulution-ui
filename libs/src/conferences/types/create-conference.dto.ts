import AttendeeDto from '@libs/conferences/types/attendee.dto';

class CreateConferenceDto {
  name: string;

  password?: string;

  invitedAttendees: AttendeeDto[];
}

export default CreateConferenceDto;
