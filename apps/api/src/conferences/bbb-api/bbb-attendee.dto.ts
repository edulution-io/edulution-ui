import ConferenceRole from '../dto/conference-role.enum';

export default class Attendee {
  userID: string;

  fullName: string;

  role: ConferenceRole;

  clientType: string;

  // The parameters below are all boolean strings: "true" or "false"
  isPresenter: string;

  isListeningOnly: string;

  hasJoinedVoice: string;

  hasVideo: string;
}
