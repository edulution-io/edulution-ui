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
import SurveyEditorFormStore from '@libs/survey/types/editor/surveyEditorFormStore';
import SurveyEditorFormStoreInitialState from '@libs/survey/types/editor/surveyEditorFormStoreInitialState';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SURVEYS_ENDPOINT from '@libs/survey/constants/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

const useSurveyEditorFormStore = create<SurveyEditorFormStore>((set) => ({
  ...SurveyEditorFormStoreInitialState,
  reset: () => set(SurveyEditorFormStoreInitialState),

  setIsOpenSaveSurveyDialog: (state: boolean) => set({ isOpenSaveSurveyDialog: state }),

  updateOrCreateSurvey: async (survey: SurveyDto): Promise<void> => {
    set({ isLoading: true });
    try {
      const result = await eduApi.post<SurveyDto>(SURVEYS_ENDPOINT, survey);
      const resultingSurvey = result.data;
      if (resultingSurvey && survey.isPublic) {
        set({
          isOpenSharePublicSurveyDialog: true,
          // TODO: Issue 388: [REPORT] Survey - rework ids to only use the timestamps in the frontend
          publicSurveyId: resultingSurvey.id.toString('base64'),
        });
      } else {
        set({ isOpenSharePublicSurveyDialog: false, publicSurveyId: '' });
      }
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  closeSharePublicSurveyDialog: () =>
    set({ isOpenSaveSurveyDialog: false, publicSurveyId: SurveyEditorFormStoreInitialState.publicSurveyId }),
}));

export default useSurveyEditorFormStore;
