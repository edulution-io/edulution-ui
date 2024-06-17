import Survey from '@libs/survey/types/survey';
import SurveyEditorFormData from '@libs/survey/types/survey-editor-form-data';
import createSurveyId from '@libs/survey/utils/create-survey-id';
import { EMPTY_JSON } from '@libs/survey/utils/empty-json';

export const getInitialFormValues = (selectedSurvey?: Survey): SurveyEditorFormData => ({
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

export const getEmptyFormValues = (): SurveyEditorFormData => ({
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
