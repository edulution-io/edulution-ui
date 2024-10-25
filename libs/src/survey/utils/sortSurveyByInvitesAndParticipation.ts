import sortNumber from '@libs/common/utils/sortNumber';
import AttendeeDto from '@libs/user/types/attendee.dto';

export interface ObjectWithInvites {
  invitedAttendees: AttendeeDto[];
  participatedAttendees: AttendeeDto[];
}

const sortSurveyByInvitesAndParticipation = <T extends ObjectWithInvites>(a?: T, b?: T): number => {
  const byAttendees = sortNumber(a?.invitedAttendees.length, b?.invitedAttendees.length);
  if (byAttendees !== 0) {
    return byAttendees;
  }
  return sortNumber(a?.participatedAttendees.length, b?.participatedAttendees.length);
};

export default sortSurveyByInvitesAndParticipation;
