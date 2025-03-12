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
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface SurveyEditorPageStore {
  survey: SurveyDto | undefined;
  setSurvey: (survey: SurveyDto | undefined) => void;

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

const SurveyEditorPageStoreInitialState = {
  survey: undefined,

  isOpenSaveSurveyDialog: false,
  isLoading: false,

  isOpenSharePublicSurveyDialog: false,
  publicSurveyId: '',
};

const useSurveyEditorPageStore = create<SurveyEditorPageStore>((set) => ({
  ...SurveyEditorPageStoreInitialState,
  reset: () => set(SurveyEditorPageStoreInitialState),

  setSurvey: (survey: SurveyDto | undefined) => set({ survey }),

  setIsOpenSaveSurveyDialog: (state: boolean) => set({ isOpenSaveSurveyDialog: state }),

  setIsOpenSharePublicSurveyDialog: (isOpenSharePublicSurveyDialog, publicSurveyId) =>
    set({ isOpenSharePublicSurveyDialog, publicSurveyId }),

  updateOrCreateSurvey: async (survey) => {
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

  closeSharePublicSurveyDialog: () =>
    set({ isOpenSaveSurveyDialog: false, publicSurveyId: SurveyEditorPageStoreInitialState.publicSurveyId }),
}));

export default useSurveyEditorPageStore;
