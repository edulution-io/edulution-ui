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
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

interface SaveTemplateDialogStore {
  reset: () => void;

  isOpenSaveTemplateDialog: boolean;
  setIsOpenSaveTemplateDialog: (state: boolean) => void;

  name?: string;
  setName: (name?: string) => void;

  accessGroups: MultipleSelectorGroup[];
  setAccessGroups: (groups: MultipleSelectorGroup[]) => void;

  setInitialData: (template: SurveyTemplateDto) => void;

  uploadTemplate: (template: SurveyTemplateDto) => Promise<SurveyTemplateDto | null>;
  isSubmitting: boolean;
  error?: Error;
}

const SaveTemplateDialogStoreInitialState = {
  isOpenSaveTemplateDialog: false,
  name: undefined,
  accessGroups: [],
  isSubmitting: false,
  error: undefined,
};

const useSaveTemplateDialogStore = create<SaveTemplateDialogStore>((set) => ({
  ...SaveTemplateDialogStoreInitialState,
  reset: () => set(SaveTemplateDialogStoreInitialState),

  setIsOpenSaveTemplateDialog: (state: boolean) => set({ isOpenSaveTemplateDialog: state }),

  setName: (name?: string) => set({ name }),

  setAccessGroups: (accessGroups: MultipleSelectorGroup[]) => set({ accessGroups }),

  setInitialData: (template: SurveyTemplateDto) => {
    set({
      name: template.name,
      accessGroups: template.accessGroups || [],
    });
  },

  uploadTemplate: async (template: SurveyTemplateDto): Promise<SurveyTemplateDto | null> => {
    set({ isSubmitting: true });
    try {
      const surveyTemplate = {
        ...template,
        name: template.name,
        accessGroups: template.accessGroups,
      };
      const result = await eduApi.post<string>(SURVEY_TEMPLATES_ENDPOINT, surveyTemplate);
      const newTemplate = { ...surveyTemplate, name: result.data };
      if (newTemplate) {
        toast.success(t('survey.template.uploadSuccess'));
        return newTemplate;
      }
      return null;
    } catch (error) {
      handleApiError(error, set);
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));

export default useSaveTemplateDialogStore;
