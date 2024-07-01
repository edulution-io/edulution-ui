import mongoose from 'mongoose';
import SurveyEditorFormData from '@libs/survey/types/survey-editor-form-data';

// To enforce the default language set in the survey editor, set initial form like:
// const EmptySurveyFormula = JSON.parse(`{ "locale": "${i18next.language}" }`);
// TODO: Test the initial formula above thoroughly

class EmptyForm implements SurveyEditorFormData {
  readonly id: mongoose.Types.ObjectId;

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
    const time = new Date().getTime();
    this.id = mongoose.Types.ObjectId.createFromTime(time);
    this.formula = {} as JSON;
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
