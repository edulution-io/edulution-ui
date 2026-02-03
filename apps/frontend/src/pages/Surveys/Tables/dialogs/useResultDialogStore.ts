/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { create } from 'zustand';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import TSurveyAnswer from '@libs/survey/types/TSurveyAnswer';
import SurveyAnswerResponseDto from '@libs/survey/types/api/survey-answer-response.dto';
import { SURVEY_RESULT_ENDPOINT, SURVEY_ANSWER_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import resetToOriginalChoicesByUrlForSurveyFormula from '@libs/survey/utils/resetToOriginalChoicesByUrlForSurveyFormula';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface ResultDialogStore {
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  isOpenPublicResultsTableDialog: boolean;
  setIsOpenPublicResultsTableDialog: (state: boolean) => void;
  isOpenPublicResultsVisualisationDialog: boolean;
  setIsOpenPublicResultsVisualisationDialog: (state: boolean) => void;
  getSurveyResult: (surveyId: string) => Promise<void>;
  surveyResult: JSON[];

  isOpenSubmittedAnswersDialog: boolean;
  setIsOpenSubmittedAnswersDialog: (state: boolean) => void;
  getSubmittedAnswer: (surveyId: string, attendee?: string) => Promise<void>;
  selectedUser: string | undefined;
  selectUser: (user: string) => void;
  submittedAnswer: TSurveyAnswer;

  isLoading: boolean;

  reset: () => void;
}

const ResultDialogStoreInitialState: Partial<ResultDialogStore> = {
  selectedSurvey: undefined,
  isOpenPublicResultsTableDialog: false,
  isOpenPublicResultsVisualisationDialog: false,
  surveyResult: [],
  isOpenSubmittedAnswersDialog: false,
  selectedUser: undefined,
  submittedAnswer: {} as TSurveyAnswer,
  isLoading: false,
};

const useResultDialogStore = create<ResultDialogStore>((set) => ({
  ...(ResultDialogStoreInitialState as ResultDialogStore),
  reset: () => set(ResultDialogStoreInitialState),

  selectSurvey: (survey: SurveyDto | undefined) => {
    set({ selectedSurvey: undefined });
    if (!survey) {
      return;
    }
    const { formula: rawFormula, ...surveyData } = survey;
    if (!rawFormula) {
      return;
    }
    const processedFormula: SurveyFormula = resetToOriginalChoicesByUrlForSurveyFormula(rawFormula);
    set({ selectedSurvey: { ...surveyData, formula: processedFormula } });
  },

  setIsOpenPublicResultsTableDialog: (state: boolean) => set({ isOpenPublicResultsTableDialog: state }),
  setIsOpenPublicResultsVisualisationDialog: (state: boolean) => set({ isOpenPublicResultsVisualisationDialog: state }),

  getSurveyResult: async (surveyId: string): Promise<void> => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<JSON[]>(`${SURVEY_RESULT_ENDPOINT}/${surveyId}`);
      const result = response.data;
      set({ surveyResult: result });
    } catch (error) {
      handleApiError(error, set);
      set({ surveyResult: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  setIsOpenSubmittedAnswersDialog: (state: boolean) => set({ isOpenSubmittedAnswersDialog: state }),
  selectUser: (userName: string) => set({ selectedUser: userName }),

  getSubmittedAnswer: async (surveyId: string, attendee?: string): Promise<void> => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<SurveyAnswerResponseDto>(
        `${SURVEY_ANSWER_ENDPOINT}/${surveyId}${attendee ? `/${attendee}` : ''}`,
      );
      const surveyAnswer = response.data;
      const { answer } = surveyAnswer;
      set({ submittedAnswer: answer });
    } catch (error) {
      set({ submittedAnswer: {} as TSurveyAnswer });
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useResultDialogStore;
