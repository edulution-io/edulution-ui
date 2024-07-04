import mongoose from 'mongoose';
import { Group } from '@libs/user/types/groups/group';
import AttendeeDto from '@libs/conferences/types/attendee.dto';
import SurveyDto from '@libs/survey/types/survey.dto';
import SurveyEditorFormData from '@libs/survey/types/survey-editor-form-data';

class InitialSurveyForm implements SurveyEditorFormData {
  // ADDITIONAL
  participants: AttendeeDto[];

  invitedGroups: Group[];

  // SURVEY
  readonly id: mongoose.Types.ObjectId;

  formula: JSON;

  saveNo: number;

  created: Date;

  expirationDate: Date | undefined;

  expirationTime: string | undefined;

  isAnonymous: boolean;

  canSubmitMultipleAnswers: boolean;

  canShowResultsTable: boolean;

  canShowResultsChart: boolean;

  constructor(selectedSurvey?: SurveyDto) {
    this.participants = selectedSurvey?.participants || [];
    this.invitedGroups = [];

    const time = new Date().getTime();
    this.id = selectedSurvey?.id || mongoose.Types.ObjectId.createFromTime(time);
    this.formula = selectedSurvey?.formula || ({} as JSON);
    this.saveNo = selectedSurvey?.saveNo || 0;
    this.created = selectedSurvey?.created || new Date();
    this.expirationDate = selectedSurvey?.expirationDate || undefined;
    this.expirationTime = selectedSurvey?.expirationTime || undefined;
    this.isAnonymous = selectedSurvey?.isAnonymous || false;
    this.canSubmitMultipleAnswers = selectedSurvey?.canSubmitMultipleAnswers || false;

    this.canShowResultsChart = true;
    this.canShowResultsTable = true;
  }
}

export default InitialSurveyForm;
