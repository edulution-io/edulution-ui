import ConferenceRole from '../dto/conference-role.enum';

class BBBJoinRequestDto {
  fullName: string;

  meetingID: string;

  role: ConferenceRole;

  userID: string;
}

export default BBBJoinRequestDto;
