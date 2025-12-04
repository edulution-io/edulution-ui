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

import { create } from 'zustand';
import { toast } from 'sonner';
import { t } from 'i18next';
import eduApi from '@/api/eduApi';
import { SURVEY_TEMPLATES_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import handleApiError from '@/utils/handleApiError';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';


interface TemplateMenuStore {
  reset: () => void;

  isOpenTemplateMenu: boolean;
  setIsOpenTemplateMenu: (state: boolean) => void;

  uploadTemplate: (template: SurveyTemplateDto) => Promise<void>;
  isSubmitting: boolean;

  isOpenTemplateConfirmDeletion: boolean;
  setIsOpenTemplateConfirmDeletion: (state: boolean) => void;
  deleteTemplate: (templateName: string) => Promise<void>;
  setIsTemplateActive: (templateName: string, state: boolean) => Promise<void>;
  error?: Error;

  template?: SurveyTemplateDto;
  setTemplate: (template?: SurveyTemplateDto) => void;
  templates: SurveyTemplateDto[];
  fetchTemplates: () => Promise<void>;
  isLoading: boolean;
}

const TemplateMenuStoreInitialState = {
  isOpenTemplateMenu: false,
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

  setIsOpenTemplateMenu: (state: boolean) => set({ isOpenTemplateMenu: state }),

  fetchTemplates: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const result = await eduApi.get<SurveyTemplateDto[]>(SURVEY_TEMPLATES_ENDPOINT);
      set({ templates: result.data });
    } catch (error) {
      handleApiError(error, set);
    }
  },

  setTemplate: (template?: SurveyTemplateDto) => set({ template }),

  uploadTemplate: async (template: SurveyTemplateDto): Promise<void> => {
    set({ isSubmitting: true });
    try {
      const result = await eduApi.post<string>(SURVEY_TEMPLATES_ENDPOINT, template);
      const newTemplate = { ...template, name: result.data };
      set({ template: newTemplate });
    } catch (error) {
      handleApiError(error, set);
      set({ template: undefined });
    } finally {
      set({ isSubmitting: false });
    }
  },

  setIsOpenTemplateConfirmDeletion: (state: boolean) => set({ isOpenTemplateConfirmDeletion: state }),

  deleteTemplate: async (templateName: string): Promise<void> => {
    if (!templateName) {
      return;
    }
    set({ isSubmitting: true });
    try {
      await eduApi.delete(`${SURVEY_TEMPLATES_ENDPOINT}/${templateName}`);
      toast.success(t('survey.editor.templateMenu.deletion.success'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isSubmitting: false });
    }
  },

  setIsTemplateActive: async (templateName: string, state: boolean): Promise<void> => {
    if (!templateName) {
      return;
    }
    set({ isSubmitting: true });
    try {
      await eduApi.patch<SurveyTemplateDto>(`${SURVEY_TEMPLATES_ENDPOINT}/${templateName}/${state}`);
      toast.success(t('survey.editor.templateMenu.upload.success'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isSubmitting: false });
    }
  },
}));

export default useTemplateMenuStore;
