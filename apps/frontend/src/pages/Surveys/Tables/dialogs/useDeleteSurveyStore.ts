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
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface DeleteSurveyStore {
  isDeleteSurveysDialogOpen: boolean;
  setIsDeleteSurveysDialogOpen: (isOpen: boolean) => void;
  deleteSurveys: (surveys: SurveyDto[]) => Promise<void>;
  isLoading: boolean;
  reset: () => void;
  error?: Error;
}

const DeleteSurveyStoreInitialState: Partial<DeleteSurveyStore> = {
  isDeleteSurveysDialogOpen: false,
  isLoading: false,
  error: undefined,
};

const useDeleteSurveyStore = create<DeleteSurveyStore>((set) => ({
  ...(DeleteSurveyStoreInitialState as DeleteSurveyStore),
  reset: () => set(DeleteSurveyStoreInitialState),

  setIsDeleteSurveysDialogOpen: (isOpen) => set({ isDeleteSurveysDialogOpen: isOpen, error: undefined }),
  deleteSurveys: async (surveys: SurveyDto[]) => {
    set({ isLoading: true, error: undefined });
    try {
      await eduApi.delete(SURVEYS, {
        data: { surveyIds: surveys.map((survey) => survey.id) },
      });
      toast.success(
        `${surveys.length > 1 ? t('surveys.deletedSurveys', { count: surveys.length }) : t('surveys.deletedSurvey')}`,
      );
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useDeleteSurveyStore;
