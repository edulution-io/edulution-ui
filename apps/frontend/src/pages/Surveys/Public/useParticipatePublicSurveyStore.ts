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

import mongoose from 'mongoose';
import { create } from 'zustand';
import { CompleteEvent } from 'survey-core';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import ParticipatePublicSurveyStore from '@libs/survey/types/participatePublicSurveyStore';
import ParticipatePublicSurveyStoreInitialState from '@libs/survey/types/participatePublicSurveyStoreInitialState';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

const useParticipatePublicSurveyStore = create<ParticipatePublicSurveyStore>((set) => ({
  ...ParticipatePublicSurveyStoreInitialState,
  reset: () => set(ParticipatePublicSurveyStoreInitialState),

  setAnswer: (answer: JSON) => set({ answer }),
  setPageNo: (pageNo: number) => set({ pageNo }),

  getPublicSurvey: async (surveyId: string): Promise<void> => {
    set({ isFetching: true });
    try {
      const response = await eduApi.get<SurveyDto>(`${PUBLIC_SURVEYS_ENDPOINT}/`, { params: { surveyId } });
      const publicSurvey = response.data;
      set({ publicSurvey });
    } catch (error) {
      set({ publicSurvey: undefined });
      handleApiError(error, set);
    } finally {
      set({ isFetching: false });
    }
  },

  answerPublicSurvey: async (
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
    surveyEditorCallbackOnSave?: CompleteEvent,
  ): Promise<void> => {
    set({ isSubmitting: true });
    try {
      surveyEditorCallbackOnSave?.showSaveInProgress();
      await eduApi.post<string>(PUBLIC_SURVEYS_ENDPOINT, {
        surveyId,
        saveNo,
        answer,
      });
      surveyEditorCallbackOnSave?.showSaveSuccess();
    } catch (error) {
      surveyEditorCallbackOnSave?.showSaveError();
      handleApiError(error, set);
    } finally {
      set({ isSubmitting: false });
    }
  },
}));

export default useParticipatePublicSurveyStore;
