import mongoose from 'mongoose';
import SurveyDto from '@libs/survey/types/survey.dto';
import SurveyEditorFormData from '@libs/survey/types/survey-editor-form-data';
import AttendeeDto from '@libs/conferences/types/attendee.dto';

class InitialSurveyForm implements SurveyEditorFormData {
  readonly id: mongoose.Types.ObjectId;

  formula: JSON;

  participants: AttendeeDto[];

  participated: string[];

  saveNo: number;

  created: Date;

  expirationDate: Date | undefined;

  expirationTime: string | undefined;

  isAnonymous: boolean;

  canSubmitMultipleAnswers: boolean;

  canShowResultsTable: boolean;

  canShowResultsChart: boolean;

  constructor(selectedSurvey?: SurveyDto) {
    const time = new Date().getTime();
    this.id = selectedSurvey?.id || mongoose.Types.ObjectId.createFromTime(time);
    this.formula = selectedSurvey?.formula || ({} as JSON);
    this.participants = selectedSurvey?.participants || [];
    this.participated = [];
    this.saveNo = selectedSurvey?.saveNo || 0;
    this.created = selectedSurvey?.created || new Date();
    this.expirationDate = selectedSurvey?.expirationDate || undefined;
    this.expirationTime = selectedSurvey?.expirationTime || undefined;
    this.isAnonymous = selectedSurvey?.isAnonymous || false;
    this.canSubmitMultipleAnswers = selectedSurvey?.canSubmitMultipleAnswers || false;
    // this.invitedGroups = [];

    this.canShowResultsChart = true;
    this.canShowResultsTable = true;
  }
}

export default InitialSurveyForm;
