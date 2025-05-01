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
import {
  SURVEYS,
  PUBLIC_SURVEYS,
  ANSWER,
  SURVEY_ANSWER_ENDPOINT,
  CHECK_EXISTING_PUBLIC_USER,
} from '@libs/survey/constants/surveys-endpoint';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';
import AttendeeDto from '@libs/user/types/attendee.dto';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';

interface ParticipateSurveyStore {
  attendee: AttendeeDto | undefined;
  setAttendee: (attendee: AttendeeDto | undefined) => void;

  answerSurvey: (
    answerDto: SubmitAnswerDto,
    sender: Model,
    options: CompletingEvent,
  ) => Promise<SurveyAnswerDto | undefined>;
  isSubmitting: boolean;

  checkForMatchingUserNameAndPubliUserId: (surveyId: string, attendee: AttendeeDto) => Promise<void>;
  existsMatchingUserNameAndPubliUserId: boolean;
  setIsUserAuthenticated: (isUserAuthenticated: boolean) => void;
  isUserAuthenticated: boolean;

  fetchAnswer: (surveyId: string) => Promise<void>;
  previousAnswer: SurveyAnswerDto | undefined;
  isFetching: boolean;

  publicUserLogin?: { publicUserName: string; publicUserId: string };

  reset: () => void;
}

const ParticipateSurveyStoreInitialState: Partial<ParticipateSurveyStore> = {
  attendee: undefined,

  isSubmitting: false,

  existsMatchingUserNameAndPubliUserId: false,
  isUserAuthenticated: false,

  previousAnswer: undefined,
  isFetching: false,

  publicUserLogin: undefined,
};

const useParticipateSurveyStore = create<ParticipateSurveyStore>((set, get) => ({
  ...(ParticipateSurveyStoreInitialState as ParticipateSurveyStore),
  reset: () => set(ParticipateSurveyStoreInitialState),

  setAttendee: (attendee: AttendeeDto | undefined) => set({ attendee }),

  answerSurvey: async (
    answerDto: SubmitAnswerDto,
    surveyModel: Model,
    completingEvent: CompletingEvent,
  ): Promise<SurveyAnswerDto | undefined> => {
    const { surveyId, saveNo, answer, isPublic = false } = answerDto;
    const { isSubmitting, attendee } = get();
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

      const surveyAnswer: SurveyAnswerDto = response.data;
      const { publicUserName, publicUserId } = surveyAnswer.attendee;
      if (publicUserName && publicUserId) {
        set({ publicUserLogin: { publicUserName, publicUserId }, previousAnswer: surveyAnswer });
      } else {
        set({ publicUserLogin: undefined, previousAnswer: undefined });
      }
      return surveyAnswer;
    } catch (error) {
      set({ publicUserLogin: undefined, previousAnswer: undefined });
      handleApiError(error, set);
      toast.error(t('survey.errors.submitAnswerError'));
      return undefined;
    } finally {
      set({ isSubmitting: false });
    }
  },

  fetchAnswer: async (surveyId: string): Promise<void> => {
    const { attendee } = get();
    set({ isFetching: true });
    try {
      let response: AxiosResponse<SurveyAnswerDto> | undefined;
      if (attendee?.publicUserName) {
        if (!attendee?.publicUserId) {
          throw new Error(SurveyErrorMessages.MISSING_ID_ERROR);
        }
        response = await eduApi.post<SurveyAnswerDto>(`${PUBLIC_SURVEYS}/${ANSWER}`, { surveyId, attendee });
      } else {
        response = await eduApi.post<SurveyAnswerDto>(SURVEY_ANSWER_ENDPOINT, { surveyId, attendee });
      }
      const surveyAnswer: SurveyAnswerDto = response.data;
      set({ previousAnswer: surveyAnswer });
    } catch (error) {
      set({ previousAnswer: undefined });
    } finally {
      set({ isFetching: false });
    }
  },

  checkForMatchingUserNameAndPubliUserId: async (surveyId: string, attendee: AttendeeDto): Promise<void> => {
    set({ isFetching: true });
    try {
      const response = await eduApi.post<SurveyAnswerDto>(`${PUBLIC_SURVEYS}/${CHECK_EXISTING_PUBLIC_USER}`, {
        surveyId,
        attendee,
      });
      const surveyAnswer: SurveyAnswerDto = response.data;
      set({ previousAnswer: surveyAnswer, existsMatchingUserNameAndPubliUserId: true });
    } catch (error) {
      set({ previousAnswer: undefined, existsMatchingUserNameAndPubliUserId: false });
    } finally {
      set({ isFetching: false });
    }
  },

  setIsUserAuthenticated: (isUserAuthenticated: boolean) => set({ isUserAuthenticated }),
}));

export default useParticipateSurveyStore;
