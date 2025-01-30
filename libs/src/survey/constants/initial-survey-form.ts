import mongoose from 'mongoose';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import AttendeeDto from '@libs/user/types/attendee.dto';
import getNewSurveyId from '@libs/survey/utils/getNewSurveyId';
import getDefaultSurveyFormula from '@libs/survey/utils/getDefaultSurveyFormula';

class InitialSurveyForm implements SurveyDto {
  readonly id: mongoose.Types.ObjectId;

  formula: TSurveyFormula;

  saveNo: number;

  creator: AttendeeDto;

  invitedAttendees: AttendeeDto[];

  invitedGroups: MultipleSelectorGroup[];

  participatedAttendees: AttendeeDto[];

  answers: mongoose.Types.ObjectId[];

  created: Date;

  expires: Date | undefined;

  isAnonymous: boolean;

  canSubmitMultipleAnswers: boolean;

  canShowResultsTable: boolean;

  canShowResultsChart: boolean;

  constructor(creator: AttendeeDto, selectedSurvey?: SurveyDto) {
    this.id = selectedSurvey?.id || getNewSurveyId();
    this.formula = selectedSurvey?.formula || getDefaultSurveyFormula();
    this.saveNo = selectedSurvey?.saveNo || 0;
    this.creator = creator;
    this.invitedAttendees = selectedSurvey?.invitedAttendees || [];
    this.invitedGroups = selectedSurvey?.invitedGroups || [];
    this.participatedAttendees = selectedSurvey?.participatedAttendees || [];
    this.answers = selectedSurvey?.answers || [];
    this.created = selectedSurvey?.created || new Date();
    this.expires = selectedSurvey?.expires || undefined;
    this.isAnonymous = selectedSurvey?.isAnonymous || false;
    this.canSubmitMultipleAnswers = selectedSurvey?.canSubmitMultipleAnswers || false;

    this.canShowResultsChart = true;
    this.canShowResultsTable = true;
  }
}

export default InitialSurveyForm;
