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
import { SURVEYS, PUBLIC_SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import SubmitAnswerDto from '@libs/survey/types/api/submit-answer.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface ParticipateSurveyStore {
  answer: JSON;
  setAnswer: (answer: JSON) => void;
  pageNo: number;
  setPageNo: (pageNo: number) => void;
  answerSurvey: (answerDto: SubmitAnswerDto) => Promise<boolean>;
  isSubmitting: boolean;
  hasFinished: boolean;
  setHasFinished: (hasFinished: boolean) => void;
  reset: () => void;
}

const ParticipateSurveyStoreInitialState: Partial<ParticipateSurveyStore> = {
  pageNo: 0,
  answer: {} as JSON,
  isSubmitting: false,
  hasFinished: false,
};

const useParticipateSurveyStore = create<ParticipateSurveyStore>((set) => ({
  ...(ParticipateSurveyStoreInitialState as ParticipateSurveyStore),
  reset: () => set(ParticipateSurveyStoreInitialState),

  setAnswer: (answer: JSON) => set({ answer }),
  setPageNo: (pageNo: number) => set({ pageNo }),

  answerSurvey: async (answerDto: SubmitAnswerDto): Promise<boolean> => {
    const { surveyId, saveNo, answer, isPublic = false } = answerDto;
    set({ isSubmitting: true });
    try {
      if (isPublic) {
        await eduApi.post<string>(PUBLIC_SURVEYS, { surveyId, saveNo, answer });
      } else {
        await eduApi.patch<string>(SURVEYS, { surveyId, saveNo, answer });
      }
      set({ hasFinished: true });
      return true;
    } catch (error) {
      handleApiError(error, set);
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  setHasFinished: (hasFinished: boolean) => set({ hasFinished }),
}));

export default useParticipateSurveyStore;
