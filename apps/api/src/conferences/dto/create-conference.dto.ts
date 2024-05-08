class CreateConferenceDto {
  name: string;

  password?: string;

  creator: string;

  attendees: string[];
}

export default CreateConferenceDto;
