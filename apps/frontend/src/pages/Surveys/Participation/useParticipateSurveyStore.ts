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
import { Model, CompletingEvent, SurveyModel, UploadFilesEvent, ClearFilesEvent } from 'survey-core';
import SurveyAnswerResponseDto from '@libs/survey/types/api/survey-answer-response.dto';
import AnswerSurvey from '@libs/survey/types/api/answer-survey';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import {
  SURVEYS,
  PUBLIC_SURVEYS,
  SURVEY_ANSWER_ENDPOINT,
  PUBLIC_USER,
  SURVEYS_ANSWER_FILE_ATTACHMENT_ENDPOINT,
} from '@libs/survey/constants/surveys-endpoint';
import { publicUserLoginRegex } from '@libs/survey/utils/publicUserLoginRegex';
import AttendeeDto from '@libs/user/types/attendee.dto';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';
import SURVEY_ANSWERS_MAXIMUM_FILE_SIZE from '@libs/survey/constants/survey-answers-maximum-file-size';
import { FileDownloadDto } from '@libs/survey/types/api/file-download.dto';
import { removeUuidFromFileName } from '@libs/common/utils/uuidAndFileNames';

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

  uploadTempFiles: (
    formData: FormData,
    surveyId: string,
    questionName: string,
  ) => Promise<Record<string, { name: string; url: string; content: Buffer<ArrayBufferLike> }> | null>;
  uploadTempFile: (
    formData: FormData,
    surveyId: string,
    questionName: string,
  ) => Promise<{ name: string; url: string; content: Buffer<ArrayBufferLike> } | null>;
  onUploadFiles: (_: SurveyModel, options: UploadFilesEvent, surveyId: string) => Promise<void>;
  isUploadingFile?: boolean;

  deleteTempFiles: (surveyId: string, questionName: string) => Promise<string>;
  deleteTempFile: (surveyId: string, questionName: string, file: File & { content?: string }) => Promise<string>;
  onClearFiles: (_: SurveyModel, options: ClearFilesEvent, surveyId: string) => Promise<void>;
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

  uploadTempFiles: async (
    formData: FormData,
    surveyId: string,
    questionName: string,
  ): Promise<Record<string, { name: string; url: string; content: Buffer<ArrayBufferLike> }> | null> => {
    const { attendee } = get();
    set({ isUploadingFile: true });

    try {
      const response = await eduApi.post<
        Record<string, { name: string; url: string; content: Buffer<ArrayBufferLike> }>
      >(
        `${SURVEYS_ANSWER_FILE_ATTACHMENT_ENDPOINT}/${attendee?.username || attendee?.firstName}/${surveyId}/${questionName}`,
        formData,
        {
          headers: { [HTTP_HEADERS.ContentType]: RequestResponseContentType.MULTIPART_FORM_DATA },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error: ', error);
      return null;
    } finally {
      set({ isUploadingFile: false });
    }
  },

  // uploadTempFile: async (
  //   surveyId: string,
  //   file: File,
  // ): Promise<{ name: string; url: string; content: Buffer<ArrayBufferLike> } | null> => {
  //   const { attendee } = get();
  //   set({ isUploadingFile: true });
  //   try {
  //     const formData = new FormData();
  //     formData.append('file', file);
  //     const response = await eduApi.post<{ name: string; url: string; content: Buffer<ArrayBufferLike> }>(
  //       `${SURVEYS_ANSWER_FILE_ATTACHMENT_ENDPOINT}/${attendee?.username || attendee?.firstName}/${surveyId}`,
  //       formData,
  //       {
  //         headers: { [HTTP_HEADERS.ContentType]: RequestResponseContentType.MULTIPART_FORM_DATA },
  //       },
  //     );
  //     return response.data;
  //   } catch (error) {
  //     handleApiError(error, set);
  //     return null;
  //   } finally {
  //     set({ isUploadingFile: false });
  //   }
  // },

  // onUploadFiles: async (_: SurveyModel, options: UploadFilesEvent, surveyId: string) => {
  //   const { uploadTempFiles } = get();
  //   const formData = new FormData();
  //   options.files.forEach((file) => {
  //     formData.append(file.name, file);
  //   });
  //   const questionName = options.question?.name;
  //   const response = await uploadTempFiles(formData, surveyId, questionName);
  //   if (response === null) {
  //     options.callback([]);
  //     return;
  //   }
  //   options.callback(
  //     options.files.map((file) => ({
  //       file,
  //       content: `${EDU_API_URL}/${response[file.name]?.url}`,
  //     })),
  //   );
  // },

  uploadTempFile: async (formData: FormData, surveyId: string, questionName: string) => {
    const { attendee } = get();
    set({ isUploadingFile: true });

    try {
      const response = await eduApi.post<{ name: string; url: string; content: Buffer<ArrayBufferLike> }>(
        `${SURVEYS_ANSWER_FILE_ATTACHMENT_ENDPOINT}/${attendee?.username || attendee?.firstName}/${surveyId}/${questionName}`,
        formData,
        {
          headers: { [HTTP_HEADERS.ContentType]: RequestResponseContentType.MULTIPART_FORM_DATA },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error: ', error);
      return null;
    } finally {
      set({ isUploadingFile: false });
    }
  },

  onUploadFiles: async (_: SurveyModel, options: UploadFilesEvent, surveyId: string) => {
    const { files, callback } = options;
    if (!surveyId || !files?.length || files.some((file) => !file.name?.length)) {
      callback([]);
      return;
    }
    if (files.some((file) => file.size > SURVEY_ANSWERS_MAXIMUM_FILE_SIZE)) {
      toast.error(t('survey.participate.fileSizeExceeded', { size: SURVEY_ANSWERS_MAXIMUM_FILE_SIZE / (1024 * 1024) }));
      callback([]);
      return;
    }

    const { uploadTempFile } = get();
    const questionName = options.question?.name;
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const data = await uploadTempFile(formData, surveyId, questionName);
      if (data === null) {
        return null;
      }

      const newFile: FileDownloadDto = {
        ...file,
        type: file.type || '*/*',
        originalName: data.name || file.name,
        name: removeUuidFromFileName(data.name || file.name),
        url: `${EDU_API_URL}/${data.url}`,
        content: data.content,
      };
      return newFile;
    });
    const results = await Promise.all(uploadPromises);
    const filteredResults = results.filter((result) => result !== null);
    callback(
      filteredResults.map((result) => ({
        file: result,
        content: result.url,
      })),
    );
  },

  deleteTempFiles: async (surveyId: string, questionName: string): Promise<string> => {
    // eslint-disable-next-line no-console
    console.log('Delete all Temp Files...');

    const { attendee } = get();
    try {
      const response = await eduApi.delete<string>(
        `${SURVEYS_ANSWER_FILE_ATTACHMENT_ENDPOINT}/${attendee?.username || attendee?.firstName}/${surveyId}/${questionName}`,
      );
      if (response.status === 200) {
        toast.success(`Files for the question with ${questionName} were deleted successfully`);
        return 'success';
      }
    } catch (error) {
      toast.error(`Failed to delete file for the question with ID: ${questionName}`);
    }
    return 'error';
  },

  deleteTempFile: async (
    surveyId: string,
    questionName: string,
    file: File & { content?: string },
  ): Promise<string> => {
    // eslint-disable-next-line no-console
    console.log('Delete Temp File:', file.name);

    const { attendee } = get();
    const fileName = file.name || file.content?.split('/').pop();
    try {
      const response = await eduApi.delete<string>(
        `${SURVEYS_ANSWER_FILE_ATTACHMENT_ENDPOINT}/${attendee?.username || attendee?.firstName}/${surveyId}/${questionName}/${fileName}`,
      );
      if (response.status === 200) {
        toast.success(`File ${fileName} was deleted successfully`);
        return 'success';
      }
    } catch (error) {
      toast.error(`Failed to delete file: ${fileName}`);
    }
    return 'error';
  },

  onClearFiles: async (_: SurveyModel, options: ClearFilesEvent, surveyId: string): Promise<void> => {
    const { deleteTempFiles, deleteTempFile } = get();
    const questionName = options.question?.name;

    // eslint-disable-next-line no-console
    console.log('ClearFilesEvent options:', options);

    // eslint-disable-next-line no-console
    console.log('fileName:', options.fileName);

    if (options.fileName === null) {
      // eslint-disable-next-line no-console
      console.log('  -> should delete all temp files.');
      try {
        await deleteTempFiles(surveyId, questionName);
        options.callback('success');
        return;
      } catch (error) {
        options.callback('error');
        return;
      }
    }

    // eslint-disable-next-line no-console
    console.log('value:', options.value);
    let filesToDelete: Array<File & { content?: string }> = [];
    const value = options.value as undefined | (File & { content?: string }) | Array<File & { content?: string }>;
    if (!value) {
      // eslint-disable-next-line no-console
      console.log('  -> undefined -> nothing to delete.');
      options.callback('success');
      return;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        // eslint-disable-next-line no-console
        console.log('  -> empty array -> nothing to delete.');
        options.callback('success');
        return;
      }
      if (options.fileName) {
        const file = value.filter((item: File & { content?: string }) => item.name === options.fileName);
        filesToDelete.push(...file);
      } else {
        filesToDelete = value;
      }
    } else {
      filesToDelete.push(value);
    }

    // eslint-disable-next-line no-console
    console.log('filesToDelete:', filesToDelete);
    if (filesToDelete.length === 0) {
      // eslint-disable-next-line no-console
      console.log('  -> empty array -> nothing to delete.');

      console.error(`File with name ${options.fileName} is not found`);
      options.callback('error');
      return;
    }

    const results = await Promise.all(
      filesToDelete.map((file: File & { content?: string }) => deleteTempFile(surveyId, questionName, file)),
    );

    if (results.every((res) => res === 'success')) {
      options.callback('success');
    } else {
      options.callback('error');
    }
  },

  setIsUserAuthenticated: (isUserAuthenticated: boolean) => set({ isUserAuthenticated }),
}));

export default useParticipateSurveyStore;
