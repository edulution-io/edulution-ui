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
