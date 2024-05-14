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
