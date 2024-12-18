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
