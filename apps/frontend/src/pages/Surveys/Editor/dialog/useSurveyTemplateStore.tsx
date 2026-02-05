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
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import handleApiError from '@/utils/handleApiError';

interface SurveyTemplateStore {
  reset: () => void;

  isOpenTemplatePreview: boolean;
  setIsOpenTemplatePreview: (state: boolean) => void;

  isOpenTemplateConfirmDeletion: boolean;
  setIsOpenTemplateConfirmDeletion: (state: boolean) => void;
  deleteTemplate: (templateId: string) => Promise<void>;
  setIsTemplateActive: (templateId: string, state: boolean) => Promise<void>;
  error?: Error;

  templates: SurveyTemplateDto[];
  fetchTemplates: () => Promise<void>;

  selectedTemplate?: SurveyTemplateDto;
  setSelectedTemplate: (template?: SurveyTemplateDto) => void;

  templateName?: string;
  setTemplateName: (name?: string) => void;
  accessGroups: MultipleSelectorGroup[];
  setAccessGroups: (groups: MultipleSelectorGroup[]) => void;

  uploadTemplate: (template: SurveyTemplateDto) => Promise<SurveyTemplateDto | null>;

  isLoading: boolean;
}

const SurveyTemplateStoreInitialState = {
  isOpenTemplatePreview: false,
  isOpenTemplateConfirmDeletion: false,
  selectedTemplate: undefined,
  templates: [],
  templateName: undefined,
  accessGroups: [],
  isLoading: false,
  error: undefined,
};

const useSurveyTemplateStore = create<SurveyTemplateStore>((set) => ({
  ...SurveyTemplateStoreInitialState,
  reset: () => set(SurveyTemplateStoreInitialState),

  setIsOpenTemplatePreview: (state: boolean) => set({ isOpenTemplatePreview: state }),

  fetchTemplates: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const result = await eduApi.get<SurveyTemplateDto[]>(SURVEY_TEMPLATES_ENDPOINT);
      set({ templates: result.data });
    } catch (error) {
      handleApiError(error, set);
      set({ templates: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedTemplate: (template?: SurveyTemplateDto) =>
    set({
      selectedTemplate: template,
      accessGroups: template?.accessGroups || [],
      templateName: template?.name || undefined,
    }),

  setIsOpenTemplateConfirmDeletion: (state: boolean) => set({ isOpenTemplateConfirmDeletion: state }),

  deleteTemplate: async (templateId: string): Promise<void> => {
    if (!templateId) {
      return;
    }
    set({ isLoading: true });
    try {
      await eduApi.delete(`${SURVEY_TEMPLATES_ENDPOINT}/${templateId}`);
      toast.success(t('survey.editor.template.deletion.success'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  setIsTemplateActive: async (templateId: string, state: boolean): Promise<void> => {
    if (!templateId) {
      return;
    }
    set({ isLoading: true });
    try {
      await eduApi.patch<SurveyTemplateDto>(`${SURVEY_TEMPLATES_ENDPOINT}/${templateId}/${state}`);
      set((prev) => ({
        templates: prev.templates.map((tmpl) => (tmpl.id === templateId ? { ...tmpl, isActive: state } : tmpl)),
      }));
      toast.success(t('survey.editor.template.upload.success'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  setTemplateName: (name?: string) => set({ templateName: name }),

  setAccessGroups: (accessGroups: MultipleSelectorGroup[]) => set({ accessGroups }),

  uploadTemplate: async (template: SurveyTemplateDto): Promise<SurveyTemplateDto | null> => {
    set({ isLoading: true });
    try {
      const result = await eduApi.post<SurveyTemplateDto>(SURVEY_TEMPLATES_ENDPOINT, template);
      const { data } = result || {};
      if (data) {
        toast.success(t('survey.editor.template.upload.success'));
        return data;
      }
      return null;
    } catch (error) {
      handleApiError(error, set);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useSurveyTemplateStore;
