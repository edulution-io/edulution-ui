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
import { SURVEY_ANSWER_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyAnswerResponseDto from '@libs/survey/types/api/survey-answer-response.dto';
import SurveysPageView from '@libs/survey/types/api/surveysPageView';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import TSurveyAnswer from '@libs/survey/types/TSurveyAnswer';

interface SubmittedAnswersDialogStore {
  updateSelectedPageView: (pageView: SurveysPageView) => void;
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  isOpenSubmittedAnswersDialog: boolean;
  setIsOpenSubmittedAnswersDialog: (state: boolean) => void;
  getSubmittedSurveyAnswers: (surveyId: string, attendee?: string) => Promise<void>;
  user: string | undefined;
  selectUser: (user: string) => void;
  answer: TSurveyAnswer;
  isLoading: boolean;

  reset: () => void;
}

const SubmittedAnswersDialogStoreInitialState: Partial<SubmittedAnswersDialogStore> = {
  selectedSurvey: undefined,
  isOpenSubmittedAnswersDialog: false,
  user: undefined,
  answer: {} as TSurveyAnswer,
  isLoading: false,
};

const useSubmittedAnswersDialogStore = create<SubmittedAnswersDialogStore>((set) => ({
  ...(SubmittedAnswersDialogStoreInitialState as SubmittedAnswersDialogStore),
  reset: () => set(SubmittedAnswersDialogStoreInitialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  setIsOpenSubmittedAnswersDialog: (state: boolean) => set({ isOpenSubmittedAnswersDialog: state }),
  selectUser: (userName: string) => set({ user: userName }),
  getSubmittedSurveyAnswers: async (surveyId: string, attendee?: string): Promise<void> => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<SurveyAnswerResponseDto>(
        `${SURVEY_ANSWER_ENDPOINT}/${surveyId}${attendee ? `/${attendee}` : ''}`,
      );
      const surveyAnswer = response.data;
      const { answer } = surveyAnswer;
      set({ answer });
    } catch (error) {
      set({ answer: {} as TSurveyAnswer });
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useSubmittedAnswersDialogStore;
