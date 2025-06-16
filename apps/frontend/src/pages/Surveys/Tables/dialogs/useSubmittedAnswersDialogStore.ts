/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { create } from 'zustand';
import { SURVEY_ANSWER_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyAnswerResponseDto from '@libs/survey/types/api/survey-answer-response.dto';
import SurveysPageView from '@libs/survey/types/api/page-view';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface SubmittedAnswersDialogStore {
  updateSelectedPageView: (pageView: SurveysPageView) => void;
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  isOpenSubmittedAnswersDialog: boolean;
  setIsOpenSubmittedAnswersDialog: (state: boolean) => void;
  getSubmittedSurveyAnswers: (surveyId: string, attendee?: string) => Promise<void>;
  user: string | undefined;
  selectUser: (user: string) => void;
  answer: JSON;
  isLoading: boolean;

  reset: () => void;
}

const SubmittedAnswersDialogStoreInitialState: Partial<SubmittedAnswersDialogStore> = {
  selectedSurvey: undefined,
  isOpenSubmittedAnswersDialog: false,
  user: undefined,
  answer: {} as JSON,
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
      set({ answer: {} as JSON });
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useSubmittedAnswersDialogStore;
