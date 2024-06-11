import { Survey } from '@/pages/Surveys/types/survey';
import SurveyEditorForm from '@/pages/Surveys/Editor/components/survey-editor-form';
import { createSurveyId } from '@/pages/Surveys/Editor/components/create-survey-id';

const EMPTY_JSON = JSON.parse('{}');

export const getInitialFormValues = (selectedSurvey?: Survey): SurveyEditorForm => ({
  id: selectedSurvey?.id || createSurveyId(),
  formula: selectedSurvey?.formula || EMPTY_JSON,
  participants: selectedSurvey?.participants || [],
  participated: [],
  saveNo: selectedSurvey?.saveNo || 0,
  created: selectedSurvey?.created || new Date(),
  expirationDate: selectedSurvey?.expirationDate || undefined,
  expirationTime: selectedSurvey?.expirationTime || undefined,
  isAnonymous: selectedSurvey?.isAnonymous || false,
  canSubmitMultipleAnswers: selectedSurvey?.canSubmitMultipleAnswers || false,
  invitedGroups: [],

  canShowResultsChart: true,
  canShowResultsTable: true,
});

export const getEmptyFormValues = (): SurveyEditorForm => ({
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
  invitedGroups: [],

  canShowResultsChart: true,
  canShowResultsTable: true,
});
