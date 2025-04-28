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
import eduApi from '@/api/eduApi';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { SURVEY_TEMPLATES_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import handleApiError from '@/utils/handleApiError';
// import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';

interface TemplateMenuStore {
  resetTemplateStore: () => void;

  isOpenTemplateMenu: boolean;
  setIsOpenTemplateMenu: (state: boolean) => void;

  uploadTemplate: (fileName: string, surveyDto: Partial<SurveyDto>) => Promise<void>;
  isSubmitting: boolean;

  template?: SurveyDto;
  templates: SurveyDto[];
  fetchTemplates: () => Promise<void>;
  fetchTemplate: (fileName: string) => Promise<void>;
  isLoading: boolean;
}

const TemplateMenuStoreInitialState = {
  isOpenTemplateMenu: false,
  template: undefined,
  templates: [],
  isSubmitting: false,
  isLoading: false,
};

const useTemplateMenuStore = create<TemplateMenuStore>((set) => ({
  ...TemplateMenuStoreInitialState,
  resetTemplateStore: () => set(TemplateMenuStoreInitialState),

  setIsOpenTemplateMenu: (state: boolean) => set({ isOpenTemplateMenu: state }),

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

    let templateDocuments: SurveyDto[] = [];
    const promises = templateNames?.map(async (fileName) => {
      try {
        const result = await eduApi.get<SurveyDto>(`${SURVEY_TEMPLATES_ENDPOINT}/${fileName}`);
        if (result) {
          templateDocuments = [...templateDocuments, result.data];
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

    set({ isLoading: true });
  },

  fetchTemplate: async (fileName: string): Promise<void> => {
    set({ isLoading: true });
    try {
      const result = await eduApi.get<SurveyDto>(`${SURVEY_TEMPLATES_ENDPOINT}/${fileName}`);
      if (result) {
        set({ template: result.data });
      }
    } catch (error) {
      handleApiError(error, set);
      set({ template: undefined });
    } finally {
      set({ isLoading: false });
    }
  },

  uploadTemplate: async (fileName: string, surveyDto: Partial<SurveyDto>): Promise<void> => {
    set({ isSubmitting: true });
    try {
      const result = await eduApi.post<Partial<SurveyDto>>(SURVEY_TEMPLATES_ENDPOINT, {
        fileName,
        surveyDto,
      });
      if (!result) {
        throw new Error(CommonErrorMessages.FILE_NOT_PROVIDED);
      }
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isSubmitting: false });
    }
  },
}));

export default useTemplateMenuStore;
