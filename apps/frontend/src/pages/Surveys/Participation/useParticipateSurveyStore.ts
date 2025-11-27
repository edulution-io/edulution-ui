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

import { t } from 'i18next';
import { toast } from 'sonner';
import { create } from 'zustand';
import { HttpStatusCode } from 'axios';
import { Model, CompletingEvent } from 'survey-core';
import SurveyAnswerResponseDto from '@libs/survey/types/api/survey-answer-response.dto';
import AnswerSurvey from '@libs/survey/types/api/answer-survey';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import {
  PUBLIC_USER,
  PUBLIC_SURVEYS,
  SURVEY_ANSWER_ENDPOINT,
  PUBLIC_SURVEY_ANSWER_ENDPOINT,
  SURVEYS_ANSWER_FILE_ATTACHMENT_ENDPOINT,
  PUBLIC_SURVEYS_ANSWER_FILE_ATTACHMENT_ENDPOINT,
} from '@libs/survey/constants/surveys-endpoint';
import { publicUserLoginRegex } from '@libs/survey/utils/publicUserLoginRegex';
import AttendeeDto from '@libs/user/types/attendee.dto';
import eduApi from '@/api/eduApi';
import { FileDownloadDto } from '@libs/survey/types/api/file-download.dto';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import { removeUuidFromFileName } from '@libs/common/utils/uuidAndFileNames';
import handleApiError from '@/utils/handleApiError';

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
    questionId: string,
    file: File & { content?: string },
    isPublic?: boolean,
  ) => Promise<FileDownloadDto | null>;
  isUploadingFile?: boolean;

  deleteTempFile: (
    surveyId: string,
    questionId: string,
    file?: File & { content?: string },
    isPublic?: boolean,
  ) => Promise<string>;
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
      const endpoint = `${isPublic ? PUBLIC_SURVEY_ANSWER_ENDPOINT : SURVEY_ANSWER_ENDPOINT}`;
      const response = await eduApi.post<SurveyAnswerResponseDto>(endpoint, { surveyId, answer, attendee });

      if ([Number(HttpStatusCode.Ok), Number(HttpStatusCode.Created)].includes(response.status)) {
        // eslint-disable-next-line no-param-reassign
        completingEvent.allow = true;
        surveyModel.doComplete();

        const surveyAnswer: SurveyAnswerResponseDto = response.data;
        const { username = '' } = surveyAnswer.attendee || {};
        const isPublicUser = !!username && publicUserLoginRegex.test(username);
        if (isPublicUser) {
          set({ isSubmitting: false, publicUserId: username, previousAnswer: surveyAnswer });
        } else {
          set({ isSubmitting: false, publicUserId: undefined, previousAnswer: undefined });
        }
        return surveyAnswer;
      }
      set({ publicUserId: undefined, previousAnswer: undefined });
      toast.error(t('survey.errors.submitAnswerError'));
      return undefined;
    } catch (error) {
      set({ publicUserId: undefined, previousAnswer: undefined });
      handleApiError(error, set);
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
    questionId: string,
    file: File,
    isPublic = false,
  ): Promise<FileDownloadDto | null> => {
    const { attendee } = get();
    set({ isUploadingFile: true });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const endpoint = `${isPublic ? PUBLIC_SURVEYS_ANSWER_FILE_ATTACHMENT_ENDPOINT : SURVEYS_ANSWER_FILE_ATTACHMENT_ENDPOINT}`;
      const response = await eduApi.post<FileDownloadDto>(
        `${endpoint}/${attendee?.username || attendee?.firstName}/${surveyId}/${questionId}`,
        formData,
        {
          headers: { [HTTP_HEADERS.ContentType]: RequestResponseContentType.MULTIPART_FORM_DATA },
        },
      );
      if (response.data === null) {
        return null;
      }

      const newFile: FileDownloadDto = {
        ...file,
        type: file.type || '*/*',
        originalName: response.data.name || file.name,
        name: removeUuidFromFileName(response.data.name || file.name),
        url: `${EDU_API_URL}/${response.data.url}`,
        content: response.data.content,
      };
      return newFile;
    } catch (error) {
      return null;
    } finally {
      set({ isUploadingFile: false });
    }
  },

  deleteTempFile: async (surveyId: string, questionId: string, file = undefined, isPublic = false): Promise<string> => {
    const { attendee } = get();
    set({ isDeletingFile: true });
    try {
      const fileName = file?.name || file?.content?.split('/').pop() || null;
      const endpoint = `${isPublic ? PUBLIC_SURVEYS_ANSWER_FILE_ATTACHMENT_ENDPOINT : SURVEYS_ANSWER_FILE_ATTACHMENT_ENDPOINT}`;
      const response = await eduApi.delete<string>(
        `${endpoint}/${attendee?.username || attendee?.firstName}/${surveyId}/${questionId}/${fileName}`,
      );
      if (response.status === Number(HttpStatusCode.Ok)) {
        return 'success';
      }
      return 'error';
    } catch (error) {
      return 'error';
    } finally {
      set({ isDeletingFile: false });
    }
  },

  setIsUserAuthenticated: (isUserAuthenticated: boolean) => set({ isUserAuthenticated }),
}));

export default useParticipateSurveyStore;
