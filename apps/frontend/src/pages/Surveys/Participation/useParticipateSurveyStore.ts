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
import SurveyAnswerResponseDto from '@libs/survey/types/api/survey-answer-response.dto';
import AnswerSurvey from '@libs/survey/types/api/answer-survey';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import {
  SURVEYS,
  PUBLIC_SURVEYS,
  SURVEY_ANSWER_ENDPOINT,
  PUBLIC_USER,
  SURVEYS_ANSWER_TEMP_FILE_ATTACHMENT_ENDPOINT,
} from '@libs/survey/constants/surveys-endpoint';
import { publicUserLoginRegex } from '@libs/survey/utils/publicUserLoginRegex';
import AttendeeDto from '@libs/user/types/attendee.dto';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';

interface ParticipateSurveyStore {
  attendee: Partial<AttendeeDto> | undefined;
  setAttendee: (attendee: Partial<AttendeeDto> | undefined) => void;

  answerSurvey: (
    answerDto: AnswerSurvey,
    sender: Model,
    options: CompletingEvent,
  ) => Promise<SurveyAnswerResponseDto | undefined>;
  isSubmitting: boolean;

  checkForMatchingUserNameAndPubliUserId: (
    surveyId: string,
    attendee: Partial<AttendeeDto>,
    canUpdateFormerAnswer?: boolean,
  ) => Promise<boolean>;
  setIsUserAuthenticated: (isUserAuthenticated: boolean) => void;
  isUserAuthenticated: boolean;

  fetchAnswer: (surveyId: string) => Promise<void>;
  previousAnswer: SurveyAnswerResponseDto | undefined;
  isFetching: boolean;

  publicUserId?: string;

  uploadTempFile: (
    surveyId: string,
    file: File,
  ) => Promise<{ name: string; url: string; content: Buffer<ArrayBufferLike> } | null>;
  isUploadingFile?: boolean;
  deleteTempFile: (surveyId: string, file: File, callback: CallableFunction) => Promise<string | undefined>;
  isDeletingFile?: boolean;
  reset: () => void;
}

const ParticipateSurveyStoreInitialState: Partial<ParticipateSurveyStore> = {
  attendee: undefined,

  isSubmitting: false,

  isUserAuthenticated: false,

  previousAnswer: undefined,
  isFetching: false,

  publicUserId: undefined,

  isUploadingFile: false,
  isDeletingFile: false,
};

const useParticipateSurveyStore = create<ParticipateSurveyStore>((set, get) => ({
  ...(ParticipateSurveyStoreInitialState as ParticipateSurveyStore),
  reset: () => set(ParticipateSurveyStoreInitialState),

  setAttendee: (attendee: Partial<AttendeeDto> | undefined) => set({ attendee }),

  answerSurvey: async (
    answerDto: AnswerSurvey,
    surveyModel: Model,
    completingEvent: CompletingEvent,
  ): Promise<SurveyAnswerResponseDto | undefined> => {
    const { surveyId, answer, isPublic = false } = answerDto;
    const { isSubmitting, attendee } = get();
    if (isSubmitting) {
      return undefined;
    }
    set({ isSubmitting: true });

    // eslint-disable-next-line no-param-reassign
    completingEvent.allow = false;

    try {
      const response = isPublic
        ? await eduApi.post<SurveyAnswerResponseDto>(PUBLIC_SURVEYS, {
            surveyId,
            answer,
            attendee,
          })
        : await eduApi.patch<SurveyAnswerResponseDto>(SURVEYS, {
            surveyId,
            answer,
            attendee,
          });

      // eslint-disable-next-line no-param-reassign
      completingEvent.allow = true;
      surveyModel.doComplete();

      const surveyAnswer: SurveyAnswerResponseDto = response.data;
      const { username = '' } = surveyAnswer.attendee || {};
      const isPublicUser = !!username && publicUserLoginRegex.test(username);
      if (isPublicUser) {
        set({ publicUserId: username, previousAnswer: surveyAnswer });
      } else {
        set({ publicUserId: undefined, previousAnswer: undefined });
      }
      return surveyAnswer;
    } catch (error) {
      set({ publicUserId: undefined, previousAnswer: undefined });
      handleApiError(error, set);
      toast.error(t('survey.errors.submitAnswerError'));
      return undefined;
    } finally {
      set({ isSubmitting: false });
    }
  },

  fetchAnswer: async (surveyId: string): Promise<void> => {
    const { attendee } = get();
    if (!attendee || !attendee.username || publicUserLoginRegex.test(attendee.username)) {
      return;
    }
    set({ isFetching: true });
    try {
      const response = await eduApi.get<SurveyAnswerResponseDto>(
        `${SURVEY_ANSWER_ENDPOINT}/${surveyId}/${attendee.username}`,
      );
      const surveyAnswer: SurveyAnswerResponseDto = response.data;
      set({ previousAnswer: surveyAnswer });
    } catch (error) {
      set({ previousAnswer: undefined });
    } finally {
      set({ isFetching: false });
    }
  },

  checkForMatchingUserNameAndPubliUserId: async (
    surveyId: string,
    attendee: Partial<AttendeeDto>,
    canUpdateFormerAnswer: boolean = false,
  ): Promise<boolean> => {
    set({ isFetching: true });
    try {
      const response = await eduApi.get<SurveyAnswerResponseDto>(
        `${PUBLIC_SURVEYS}/${PUBLIC_USER}/${surveyId}/${attendee.username}`,
      );
      if (!response.data) {
        set({ attendee: undefined, previousAnswer: undefined });
        return false;
      }
      const surveyAnswer: SurveyAnswerResponseDto = response.data;
      set({ attendee: surveyAnswer.attendee, previousAnswer: canUpdateFormerAnswer ? surveyAnswer : undefined });
      return true;
    } catch (error) {
      set({ attendee: undefined, previousAnswer: undefined });
      return false;
    } finally {
      set({ isFetching: false });
    }
  },

  uploadTempFile: async (
    surveyId: string,
    file: File,
  ): Promise<{ name: string; url: string; content: Buffer<ArrayBufferLike> } | null> => {
    const { attendee } = get();
    set({ isUploadingFile: true });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await eduApi.post<{ name: string; url: string; content: Buffer<ArrayBufferLike> }>(
        `${SURVEYS_ANSWER_TEMP_FILE_ATTACHMENT_ENDPOINT}/${attendee?.username || attendee?.firstName}/${surveyId}`,
        formData,
        {
          headers: { [HTTP_HEADERS.ContentType]: RequestResponseContentType.MULTIPART_FORM_DATA },
        },
      );
      return response.data;
    } catch (error) {
      handleApiError(error, set);
      return null;
    } finally {
      set({ isUploadingFile: false });
    }
  },

  deleteTempFile: async (
    surveyId: string,
    file: File & { content?: string },
    callback: CallableFunction,
  ): Promise<string | undefined> => {
    const { attendee } = get();
    set({ isDeletingFile: true });
    try {
      const fileName = file.name || file.content?.split('/').pop();
      const response = await eduApi.delete<string>(
        `${SURVEYS_ANSWER_TEMP_FILE_ATTACHMENT_ENDPOINT}/${attendee?.username || attendee?.firstName}/${surveyId}/${fileName}`,
      );
      toast.success(t('survey.editor.fileDeletionSuccess'));
      callback('success', `${EDU_API_URL}/${response.data}`);
      return 'success';
    } catch (error) {
      handleApiError(error, set);
      callback('error');
      return undefined;
    } finally {
      set({ isDeletingFile: false });
    }
  },

  setIsUserAuthenticated: (isUserAuthenticated: boolean) => set({ isUserAuthenticated }),
}));

export default useParticipateSurveyStore;
