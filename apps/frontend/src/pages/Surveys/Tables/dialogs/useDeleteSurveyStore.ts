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
import SURVEYS_ENDPOINT from '@libs/survey/constants/surveys-endpoint';
import SurveyDto from '@libs/survey/types/api/survey.dto';
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

  setIsDeleteSurveysDialogOpen: (isOpen) => set({ isDeleteSurveysDialogOpen: isOpen }),
  deleteSurveys: async (surveys: SurveyDto[]) => {
    set({ isLoading: true });
    try {
      await eduApi.delete(SURVEYS_ENDPOINT, {
        data: { surveyIds: surveys.map((survey) => survey.id) },
      });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useDeleteSurveyStore;
