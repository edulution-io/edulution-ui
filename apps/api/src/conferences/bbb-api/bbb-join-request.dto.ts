// This DTO is based on a third-party object definition from the BBB (BigBlueButton) API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
import ConferenceRole from '../dto/conference-role.enum';

class BBBJoinRequestDto {
  fullName: string;

  meetingID: string;

  role: ConferenceRole;

  userID: string;
}

export default BBBJoinRequestDto;
