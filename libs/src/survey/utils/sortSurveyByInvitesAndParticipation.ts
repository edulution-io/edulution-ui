import sortNumber from '@libs/common/utils/sortNumber';
import SurveyDto from '@libs/survey/types/api/survey.dto';

const sortSurveyByInvitesAndParticipation = (a?: SurveyDto, b?: SurveyDto): number => {
  const byAttendees = sortNumber(a?.invitedAttendees.length, b?.invitedAttendees.length);
  if (byAttendees !== 0) {
    return byAttendees;
  }
  return sortNumber(a?.participatedAttendees.length, b?.participatedAttendees.length);
};

export default sortSurveyByInvitesAndParticipation;
