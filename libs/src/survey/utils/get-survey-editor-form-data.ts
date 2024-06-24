import mongoose from 'mongoose';
import i18next from 'i18next';
import SurveyEditorForm from '@libs/survey/types/survey-editor-form-data';

const EmptySurveyFormula = JSON.parse(`{ "locale": "${i18next.language}" }`);

class EmptyForm implements SurveyEditorForm {
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
    this.formula = EmptySurveyFormula;
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
