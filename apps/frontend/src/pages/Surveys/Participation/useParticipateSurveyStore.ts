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

import { AxiosResponse } from 'axios';
import { t } from 'i18next';
import { toast } from 'sonner';
import { create } from 'zustand';
import { Model, CompletingEvent } from 'survey-core';
import SurveyAnswerDto from '@libs/survey/types/api/survey-answer.dto';
import SubmitAnswerDto from '@libs/survey/types/api/submit-answer.dto';
import { SURVEYS, PUBLIC_SURVEYS, ANSWER, SURVEY_ANSWER_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import publicUserIdRegex from '@libs/survey/utils/publicUserIdRegex';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';

interface ParticipateSurveyStore {
  username: string | undefined;
  setUsername: (userinfo: string | undefined) => void;

  answerSurvey: (
    answerDto: SubmitAnswerDto,
    sender: Model,
    options: CompletingEvent,
  ) => Promise<SurveyAnswerDto | undefined>;
  isSubmitting: boolean;

  fetchAnswer: (surveyId: string, username?: string) => Promise<void>;
  previousAnswer: SurveyAnswerDto | undefined;
  isFetching: boolean;

  publicUserId: string;

  reset: () => void;
}

const ParticipateSurveyStoreInitialState: Partial<ParticipateSurveyStore> = {
  username: undefined,

  isSubmitting: false,

  previousAnswer: undefined,
  isFetching: false,

  publicUserId: '',
};

const useParticipateSurveyStore = create<ParticipateSurveyStore>((set, get) => ({
  ...(ParticipateSurveyStoreInitialState as ParticipateSurveyStore),
  reset: () => set(ParticipateSurveyStoreInitialState),

  setUsername: (username: string | undefined) => set({ username }),

  answerSurvey: async (
    answerDto: SubmitAnswerDto,
    surveyModel: Model,
    completingEvent: CompletingEvent,
  ): Promise<SurveyAnswerDto | undefined> => {
    const { surveyId, saveNo, answer, isPublic = false, attendee } = answerDto;

    const { isSubmitting } = get();
    if (isSubmitting) {
      return undefined;
    }
    set({ isSubmitting: true });

    // eslint-disable-next-line no-param-reassign
    completingEvent.allow = false;

    try {
      const response = isPublic
        ? await eduApi.post<SurveyAnswerDto>(PUBLIC_SURVEYS, {
            surveyId,
            saveNo,
            answer,
            attendee,
          })
        : await eduApi.patch<SurveyAnswerDto>(SURVEYS, {
            surveyId,
            saveNo,
            answer,
            attendee,
          });

      // eslint-disable-next-line no-param-reassign
      completingEvent.allow = true;
      surveyModel.doComplete();

      const surveyAnswer = response.data;
      const publicUserId = surveyAnswer.attendee?.username;
      if (isPublic && (surveyAnswer.attendee?.fullName || publicUserIdRegex.test(publicUserId))) {
        set({ publicUserId });
      }

      return response.data;
    } catch (error) {
      handleApiError(error, set);
      toast.error(t('survey.errors.submitAnswerError'));

      return undefined;
    } finally {
      set({ isSubmitting: false });
    }
  },

  fetchAnswer: async (surveyId: string, username?: string): Promise<void> => {
    set({ isFetching: true });
    try {
      let response: AxiosResponse<SurveyAnswerDto> | undefined;
      if (username) {
        response = await eduApi.get<SurveyAnswerDto>(`${PUBLIC_SURVEYS}/${ANSWER}/${surveyId}/${username}`);
      } else {
        response = await eduApi.post<SurveyAnswerDto>(SURVEY_ANSWER_ENDPOINT, { surveyId });
      }
      const surveyAnswer: SurveyAnswerDto = response.data;
      set({ previousAnswer: surveyAnswer });
    } catch (error) {
      set({ previousAnswer: undefined });
    } finally {
      set({ isFetching: false });
    }
  },
}));

export default useParticipateSurveyStore;
