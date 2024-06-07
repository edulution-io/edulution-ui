// This DTO is based on a third-party object definition from the BBB (BigBlueButton) API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
export default class CreateBbbMeetingDto {
  name: string;

  meetingID: string;

  attendeePW: string;

  moderatorPW: string;

  dialNumber: string;

  voiceBridge: string;

  // The parameters below are all number strings: "0" or "123141"
  duration: string;
}
