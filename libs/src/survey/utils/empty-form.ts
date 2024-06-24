import mongoose from 'mongoose';
import EmptyFormula from '@libs/survey/utils/empty-formula';
import SurveyEditorFormData from '@libs/survey/types/survey-editor-form-data';

class EmptyForm implements SurveyEditorFormData {
  id: mongoose.Types.ObjectId;
  formula: JSON;
  participants: [];
  participated: [];
  saveNo: number;
  created: Date;
  expirationDate: Date | undefined;
  expirationTime: string | undefined;
  isAnonymous: boolean;
  canSubmitMultipleAnswers: boolean;
  canShowResultsTable: boolean;
  canShowResultsChart: boolean;

  constructor() {
    this.id = new mongoose.Types.ObjectId();
    this.formula = EmptyFormula;
    this.participants = [];
    this.participated = [];
    this.saveNo = 0;
    this.created = new Date();
    this.expirationDate = undefined;
    this.expirationTime = undefined;
    this.isAnonymous = false;
    this.canSubmitMultipleAnswers = false;

    this.canShowResultsChart = true;
    this.canShowResultsTable = true;
  }
}

export default EmptyForm;
