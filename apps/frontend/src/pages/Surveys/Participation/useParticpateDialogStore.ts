import { create } from 'zustand';
import SURVEYS_ENDPOINT, { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import CommitAnswerDto from '@libs/survey/types/api/commit-answer.dto';
import ParticipateSurveyStoreInitialState from '@libs/survey/types/participation/participateSurveyStoreInitialState';
import ParticipateSurveyStore from '@libs/survey/types/participation/participateSurveyStore';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

const useParticipateSurveyStore = create<ParticipateSurveyStore>((set) => ({
  ...(ParticipateSurveyStoreInitialState as ParticipateSurveyStore),
  reset: () => set(ParticipateSurveyStoreInitialState),

  setAnswer: (answer: JSON) => set({ answer }),
  setPageNo: (pageNo: number) => set({ pageNo }),

  answerSurvey: async (answerDto: CommitAnswerDto): Promise<boolean> => {
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
}));

export default useParticipateSurveyStore;
