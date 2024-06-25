import mongoose from 'mongoose';
import Attendee from '@libs/survey/types/attendee';
import Survey from '@libs/survey/types/survey';
import SurveyEditorFormData from '@libs/survey/types/survey-editor-form-data';

class InitialForm implements SurveyEditorFormData {
  id: mongoose.Types.ObjectId;
  formula: JSON;
  participants: Attendee[];
  participated: string[];
  saveNo: number;
  created: Date;
  expirationDate: Date | undefined;
  expirationTime: string | undefined;
  isAnonymous: boolean;
  canSubmitMultipleAnswers: boolean;
  canShowResultsTable: boolean;
  canShowResultsChart: boolean;

  constructor(selectedSurvey?: Survey) {
    this.id = selectedSurvey?._id || new mongoose.Types.ObjectId();
    this.formula =  selectedSurvey?.formula || {} as JSON;
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

export default InitialForm;
