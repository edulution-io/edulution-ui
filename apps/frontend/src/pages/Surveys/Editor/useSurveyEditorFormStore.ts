import { create } from 'zustand';
import { Question } from 'survey-core/typings/question';
import SurveyEditorFormStore from '@libs/survey/types/editor/surveyEditorFormStore';
import SurveyEditorFormStoreInitialState from '@libs/survey/types/editor/surveyEditorFormStoreInitialState';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SURVEYS_ENDPOINT from '@libs/survey/constants/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

const useSurveyEditorFormStore = create<SurveyEditorFormStore>((set) => ({
  ...SurveyEditorFormStoreInitialState,
  reset: () => set(SurveyEditorFormStoreInitialState),

  setSelectedQuestion: (question: Question | undefined) => set({ selectedQuestion: question }),
  setIsOpenQuestionSettingsDialog: (state: boolean) => set({ isOpenQuestionSettingsDialog: state }),

  setIsOpenSaveSurveyDialog: (state: boolean) => set({ isOpenSaveSurveyDialog: state }),

  updateOrCreateSurvey: async (survey: SurveyDto): Promise<void> => {
    set({ isLoading: true });
    try {
      await eduApi.post<SurveyDto>(SURVEYS_ENDPOINT, survey);
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useSurveyEditorFormStore;
