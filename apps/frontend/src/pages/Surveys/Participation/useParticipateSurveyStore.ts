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

import { t } from 'i18next';
import { toast } from 'sonner';
import { create } from 'zustand';
import { Model, CompletingEvent } from 'survey-core';
import SurveyAnswerDto from '@libs/survey/types/api/survey-answer.dto';
import SubmitAnswerDto from '@libs/survey/types/api/submit-answer.dto';
import { SURVEYS, PUBLIC_SURVEYS, SURVEY_ANSWER_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';

interface ParticipateSurveyStore {
  username: string | undefined;
  setUsername: (userinfo: string | undefined) => void;
  answer: JSON;
  setAnswer: (answer: JSON) => void;
  pageNo: number;
  setPageNo: (pageNo: number) => void;

  answerSurvey: (
    answerDto: SubmitAnswerDto,
    sender: Model,
    options: CompletingEvent,
  ) => Promise<SurveyAnswerDto | undefined>;
  isSubmitting: boolean;

  fetchAnswer: (surveyId: string, username: string) => Promise<void>;
  previousAnswer: SurveyAnswerDto | undefined;
  isFetching: boolean;

  reset: () => void;
}

const ParticipateSurveyStoreInitialState: Partial<ParticipateSurveyStore> = {
  username: undefined,
  pageNo: 0,
  answer: {} as JSON,

  isSubmitting: false,

  previousAnswer: undefined,
  isFetching: false,
};

const useParticipateSurveyStore = create<ParticipateSurveyStore>((set, get) => ({
  ...(ParticipateSurveyStoreInitialState as ParticipateSurveyStore),
  reset: () => set(ParticipateSurveyStoreInitialState),

  setUsername: (username: string | undefined) => set({ username }),
  setAnswer: (answer: JSON) => set({ answer }),
  setPageNo: (pageNo: number) => set({ pageNo }),

  answerSurvey: async (
    answerDto: SubmitAnswerDto,
    sender: Model,
    options: CompletingEvent,
  ): Promise<SurveyAnswerDto | undefined> => {
    const { surveyId, saveNo, answer, isPublic = false, user } = answerDto;

    const { username } = get();
    const { isSubmitting } = get();
    if (isSubmitting) {
      return undefined;
    }
    set({ isSubmitting: true });

    // eslint-disable-next-line no-param-reassign
    options.allow = false;

    const targetUrl = isPublic ? PUBLIC_SURVEYS : SURVEYS;
    try {
      const response = await eduApi.post<SurveyAnswerDto>(targetUrl, {
        surveyId,
        saveNo,
        answer,
        username: user?.preferred_username || username,
        isPublicUserId: !user,
      });

      // eslint-disable-next-line no-param-reassign
      options.allow = true;
      sender.doComplete();

      return response.data;
    } catch (error) {
      handleApiError(error, set);
      toast.error(t('survey.errors.submitAnswerError'));

      return undefined;
    } finally {
      set({ isSubmitting: false });
    }
  },

  fetchAnswer: async (surveyId: string, username: string): Promise<void> => {
    set({ isFetching: true });
    try {
      const response = await eduApi.post<SurveyAnswerDto>(SURVEY_ANSWER_ENDPOINT, { surveyId, username });
      const surveyAnswer = response.data;
      const { answer } = surveyAnswer;
      set({ answer });
    } catch (error) {
      set({ previousAnswer: undefined });
      handleApiError(error, set);
    } finally {
      set({ isFetching: false });
    }
  },
}));

export default useParticipateSurveyStore;
