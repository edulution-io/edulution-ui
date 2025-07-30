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
import { toast } from 'sonner';
import { t } from 'i18next';
import eduApi from '@/api/eduApi';
import { SURVEY_TEMPLATES_ENDPOINT, TEMPLATES } from '@libs/survey/constants/surveys-endpoint';
import handleApiError from '@/utils/handleApiError';
import { TemplateDto, SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import APPS from '@libs/appconfig/constants/apps';

interface TemplateMenuStore {
  reset: () => void;

  isOpenTemplatePreview: boolean;
  setIsOpenTemplatePreview: (state: boolean) => void;

  uploadTemplate: (template: SurveyTemplateDto) => Promise<void>;
  isSubmitting: boolean;

  isOpenTemplateConfirmDeletion: boolean;
  setIsOpenTemplateConfirmDeletion: (state: boolean) => void;
  deleteTemplate: (templateFileName: string) => Promise<void>;
  error?: Error;

  template?: SurveyTemplateDto;
  setTemplate: (template?: SurveyTemplateDto) => void;
  templates: SurveyTemplateDto[];
  fetchTemplates: () => Promise<void>;
  isLoading: boolean;
}

const TemplateMenuStoreInitialState = {
  isOpenTemplatePreview: false,
  isOpenTemplateConfirmDeletion: false,
  template: undefined,
  templates: [],
  isSubmitting: false,
  isLoading: false,
  error: undefined,
};

const useTemplateMenuStore = create<TemplateMenuStore>((set) => ({
  ...TemplateMenuStoreInitialState,
  reset: () => set(TemplateMenuStoreInitialState),

  setIsOpenTemplatePreview: (state: boolean) => set({ isOpenTemplatePreview: state }),

  fetchTemplates: async (): Promise<void> => {
    set({ isLoading: true });

    let templateNames: string[] | undefined;
    try {
      const result = await eduApi.get<string[]>(SURVEY_TEMPLATES_ENDPOINT);
      if (result) {
        templateNames = result.data;
      }
    } catch (error) {
      handleApiError(error, set);
    }

    let templateDocuments: SurveyTemplateDto[] = [];
    const promises = templateNames?.map(async (fileName) => {
      try {
        const result = await eduApi.get<TemplateDto>(`${SURVEY_TEMPLATES_ENDPOINT}/${fileName}`);
        if (result) {
          const newTemplate = { fileName, template: { ...result.data } };
          templateDocuments = [...templateDocuments, newTemplate];
        }
      } catch (error) {
        handleApiError(error, set);
      }
    });

    if (promises) {
      try {
        await Promise.all(promises);
        set({ templates: templateDocuments });
      } catch (error) {
        set({ templates: [] });
      }
    }

    set({ isLoading: false });
  },

  setTemplate: (template?: SurveyTemplateDto) => set({ template }),

  uploadTemplate: async (surveyTemplateDto: SurveyTemplateDto): Promise<void> => {
    set({ isSubmitting: true });
    try {
      const result = await eduApi.post<string>(SURVEY_TEMPLATES_ENDPOINT, surveyTemplateDto);
      const newTemplate = { ...surveyTemplateDto, fileName: result.data };
      set({ template: newTemplate });
      toast.success(t('survey.editor.templateMenu.upload.success'));
    } catch (error) {
      handleApiError(error, set);
      set({ template: undefined });
    } finally {
      set({ isSubmitting: false });
    }
  },

  setIsOpenTemplateConfirmDeletion: (state: boolean) => set({ isOpenTemplateConfirmDeletion: state }),

  deleteTemplate: async (templateFileName: string): Promise<void> => {
    if (!templateFileName) {
      return;
    }

    set({ isSubmitting: true });
    try {
      await eduApi.delete(`${EDU_API_CONFIG_ENDPOINTS.FILES}/${APPS.SURVEYS}/${TEMPLATES}/${templateFileName}`);
      toast.success(t('survey.editor.templateMenu.deletion.success'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isSubmitting: false });
    }
  },
}));

export default useTemplateMenuStore;
