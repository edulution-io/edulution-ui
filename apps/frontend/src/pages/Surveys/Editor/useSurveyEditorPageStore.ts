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
import AttendeeDto from '@libs/user/types/attendee.dto';
import SurveyTemplateDto from '@libs/survey/types/api/surveyTemplate.dto';
import fetchSelectedSurvey from '@/pages/Surveys/utils/fetchSelectedSurvey';
import getInitialSurveyFormBySurveys from '@libs/survey/constants/get-initial-survey-form-by-surveys';
import getInitialSurveyFormByTemplate from '@libs/survey/constants/get-initial-survey-form-by-template';

interface SurveyEditorPageStore {
  assignTemplateToSelectedSurvey: (creator: AttendeeDto, template?: SurveyTemplateDto) => void;
  fetchSelectedSurvey: (creator: AttendeeDto, surveyId: string, isPublic?: boolean) => Promise<void>;
  isFetching: boolean;

  initialSurvey: SurveyDto | undefined;
  setInitialSurvey: (survey: SurveyDto | undefined) => void;

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
  isFetching: false,
  initialSurvey: undefined,

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

      assignTemplateToSelectedSurvey: (creator: AttendeeDto, template?: SurveyTemplateDto): void => {

        console.log('assignTemplateToSelectedSurvey', template);

        const newSurvey = getInitialSurveyFormByTemplate(creator, template);
        set({ initialSurvey: newSurvey });
      },

      fetchSelectedSurvey: async (creator: AttendeeDto, surveyId?: string, isPublic?: boolean): Promise<void> => {

        console.log('fetchSelectedSurvey', surveyId, isPublic);

        set({ isFetching: true, initialSurvey: undefined });
        try {
          const survey = await fetchSelectedSurvey(surveyId, isPublic);
          const initialValues = getInitialSurveyFormBySurveys(creator, survey);
          set({ initialSurvey: initialValues });
        } catch (error) {
          set({ initialSurvey: undefined });
          handleApiError(error, set);
        } finally {
          set({ isFetching: false });
        }
      },

      setInitialSurvey: (survey: SurveyDto | undefined) => set({ initialSurvey: survey }),

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
