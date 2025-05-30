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
import { toast } from 'sonner';
import { t } from 'i18next';
import { Model, CompletingEvent } from 'survey-core';
import { SURVEYS, PUBLIC_SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import SubmitAnswerDto from '@libs/survey/types/api/submit-answer.dto';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';

interface ParticipateSurveyStore {
  answer: JSON;
  setAnswer: (answer: JSON) => void;
  pageNo: number;
  setPageNo: (pageNo: number) => void;
  answerSurvey: (answerDto: SubmitAnswerDto, sender: Model, options: CompletingEvent) => Promise<boolean>;
  isSubmitting: boolean;
  reset: () => void;
}

const ParticipateSurveyStoreInitialState: Partial<ParticipateSurveyStore> = {
  pageNo: 0,
  answer: {} as JSON,
  isSubmitting: false,
};

const useParticipateSurveyStore = create<ParticipateSurveyStore>((set, get) => ({
  ...(ParticipateSurveyStoreInitialState as ParticipateSurveyStore),
  reset: () => set(ParticipateSurveyStoreInitialState),

  setAnswer: (answer: JSON) => set({ answer }),
  setPageNo: (pageNo: number) => set({ pageNo }),

  answerSurvey: async (answerDto: SubmitAnswerDto, sender: Model, options: CompletingEvent): Promise<boolean> => {
    const { surveyId, saveNo, answer, isPublic = false } = answerDto;
    const { isSubmitting } = get();
    if (isSubmitting) {
      return false;
    }
    set({ isSubmitting: true });

    // eslint-disable-next-line no-param-reassign
    options.allow = false;

    try {
      if (isPublic) {
        await eduApi.post(PUBLIC_SURVEYS, { surveyId, saveNo, answer });
      } else {
        await eduApi.patch(SURVEYS, { surveyId, saveNo, answer });
      }

      // eslint-disable-next-line no-param-reassign
      options.allow = true;
      sender.doComplete();

      return true;
    } catch (error) {
      handleApiError(error, set);
      toast.error(t('survey.errors.submitAnswerError'));

      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));

export default useParticipateSurveyStore;
