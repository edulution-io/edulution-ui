// This DTO is based on a third-party object definition from the BBB (BigBlueButton) API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

import ConferenceRole from '@libs/conferences/types/conference-role.enum';

export default class BbbAttendeeDto {
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
