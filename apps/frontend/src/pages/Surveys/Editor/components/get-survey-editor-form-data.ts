import SurveyEditorForm from '@libs/survey/types/survey-editor-form-data';
import createSurveyId from '@/pages/Surveys/Editor/components/create-survey-id';

const EMPTY_JSON = JSON.parse('{}') as JSON;

const getEmptyFormValues = (): SurveyEditorForm => ({
  id: createSurveyId(),
  formula: EMPTY_JSON,
  participants: [],
  participated: [],
  saveNo: 0,
  created: new Date(),
  expirationDate: undefined,
  expirationTime: undefined,
  isAnonymous: false,
  canSubmitMultipleAnswers: false,

  canShowResultsChart: true,
  canShowResultsTable: true,
});

export default getEmptyFormValues;
