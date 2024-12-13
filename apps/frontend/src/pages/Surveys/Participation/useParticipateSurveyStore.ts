import { create } from 'zustand';
import SURVEYS_ENDPOINT, { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
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
    const { surveyId, saveNo, answer, surveyEditorCallbackOnSave, isPublic = false } = answerDto;
    set({ isSubmitting: true });
    try {
      surveyEditorCallbackOnSave?.showSaveInProgress();

      if (isPublic) {
        await eduApi.post<string>(PUBLIC_SURVEYS_ENDPOINT, { surveyId, saveNo, answer });
      } else {
        await eduApi.patch<string>(SURVEYS_ENDPOINT, { surveyId, saveNo, answer });
      }

      surveyEditorCallbackOnSave?.showSaveSuccess();
      set({ hasFinished: true });
      return true;
    } catch (error) {
      surveyEditorCallbackOnSave?.showSaveError();
      handleApiError(error, set);
      return false;
    } finally {
      set({ isSubmitting: false });
    }
    return false;
  },

  setHasFinished: (hasFinished: boolean) => set({ hasFinished }),
}));

export default useParticipateSurveyStore;
