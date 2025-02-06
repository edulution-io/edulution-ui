import i18next from 'i18next';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

class InitialSurveyForm implements SurveyDto {
  readonly id?: string;

  formula: TSurveyFormula;

  saveNo: number;

  creator: AttendeeDto;

  invitedAttendees: AttendeeDto[];

  invitedGroups: MultipleSelectorGroup[];

  participatedAttendees: AttendeeDto[];

  answers: string[];

  createdAt: Date;

  expires: Date | undefined;

  isAnonymous: boolean;

  canSubmitMultipleAnswers: boolean;

  constructor(creator: AttendeeDto, selectedSurvey?: SurveyDto) {
    this.id = selectedSurvey?.id;
    this.formula = selectedSurvey?.formula || { title: i18next.t('survey.newTitle').toString() };
    this.saveNo = selectedSurvey?.saveNo || 0;
    this.creator = creator;
    this.invitedAttendees = selectedSurvey?.invitedAttendees || [];
    this.invitedGroups = selectedSurvey?.invitedGroups || [];
    this.participatedAttendees = selectedSurvey?.participatedAttendees || [];
    this.answers = selectedSurvey?.answers || [];
    this.createdAt = selectedSurvey?.createdAt || new Date();
    this.expires = selectedSurvey?.expires || undefined;
    this.isAnonymous = selectedSurvey?.isAnonymous || false;
    this.canSubmitMultipleAnswers = selectedSurvey?.canSubmitMultipleAnswers || false;
  }
}

export default InitialSurveyForm;
