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

import { toast } from 'sonner';
import { t } from 'i18next';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { SURVEY_TEMP_FILE_ATTACHMENT_ENDPOINT, SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import eduApi from '@/api/eduApi';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import handleApiError from '@/utils/handleApiError';

interface SurveyEditorPageStore {
  storedSurvey: SurveyDto | undefined;
  updateStoredSurvey: (survey: SurveyDto) => void;
  resetStoredSurvey: () => void;

  uploadFile: (file: File, callback: CallableFunction) => Promise<void>;
  isUploadingFile: boolean;

  isOpenSaveSurveyDialog: boolean;
  setIsOpenSaveSurveyDialog: (state: boolean) => void;
  updateOrCreateSurvey: (survey: SurveyDto) => Promise<boolean>;
  isLoading: boolean;

  isOpenSharePublicSurveyDialog: boolean;
  setIsOpenSharePublicSurveyDialog: (isOpen: boolean, publicSurveyId: string) => void;
  publicSurveyId: string;
  closeSharePublicSurveyDialog: () => void;

  reset: () => void;
}

type PersistedSurveyEditorPageStore = (
  survey: StateCreator<SurveyEditorPageStore>,
  options: PersistOptions<Partial<SurveyEditorPageStore>>,
) => StateCreator<SurveyEditorPageStore>;

const initialState = {
  storedSurvey: undefined,

  isUploadingFile: false,

  isOpenSaveSurveyDialog: false,
  isLoading: false,

  isOpenSharePublicSurveyDialog: false,
  publicSurveyId: '',
};

const useSurveyEditorPageStore = create<SurveyEditorPageStore>(
  (persist as PersistedSurveyEditorPageStore)(
    (set) => ({
      ...initialState,
      reset: () => set(initialState),

      updateStoredSurvey: (survey: SurveyDto) => set({ storedSurvey: survey }),
      resetStoredSurvey: () => set({ storedSurvey: undefined }),

      setIsOpenSaveSurveyDialog: (state: boolean) => set({ isOpenSaveSurveyDialog: state }),

      setIsOpenSharePublicSurveyDialog: (isOpenSharePublicSurveyDialog, publicSurveyId) =>
        set({ isOpenSharePublicSurveyDialog, publicSurveyId }),

      updateOrCreateSurvey: async (survey: SurveyDto): Promise<boolean> => {
        set({ isLoading: true });
        try {
          const result = await eduApi.post<SurveyDto>(SURVEYS, survey);
          const resultingSurvey = result.data;
          if (resultingSurvey && survey.isPublic) {
            set({
              isOpenSharePublicSurveyDialog: true,
              publicSurveyId: resultingSurvey.id,
            });
          } else {
            set({ isOpenSharePublicSurveyDialog: false, publicSurveyId: undefined });
          }
          return true;
        } catch (error) {
          handleApiError(error, set);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      uploadFile: async (file: File, callback: CallableFunction): Promise<void> => {
        set({ isUploadingFile: true });
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await eduApi.post<string>(`${SURVEY_TEMP_FILE_ATTACHMENT_ENDPOINT}`, formData, {
            headers: { [HTTP_HEADERS.ContentType]: RequestResponseContentType.MULTIPART_FORM_DATA },
          });
          toast.success(t('survey.editor.fileUploadSuccess'));
          callback('success', `${EDU_API_URL}/${response.data}`);
        } catch (error) {
          handleApiError(error, set);
          callback('error');
        } finally {
          set({ isUploadingFile: false });
        }
      },

      closeSharePublicSurveyDialog: () =>
        set({ isOpenSaveSurveyDialog: false, publicSurveyId: initialState.publicSurveyId }),
    }),
    {
      name: 'survey-editor-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ storedSurvey: state.storedSurvey }),
    },
  ),
);

export default useSurveyEditorPageStore;
