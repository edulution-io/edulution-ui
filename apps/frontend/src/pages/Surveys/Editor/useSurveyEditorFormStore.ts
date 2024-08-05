import { create } from 'zustand';
import SurveyDto from '@libs/survey/types/survey.dto';
import SURVEYS_ENDPOINT from '@libs/survey/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import SurveyEditorFormStore from '@/pages/Surveys/Editor/surveyEditorFormStore';
import SurveyEditorFormStoreInitialState from '@/pages/Surveys/Editor/surveyEditorFormStoreInitialState';

const useSurveyEditorFormStore = create<SurveyEditorFormStore>((set) => ({
  ...SurveyEditorFormStoreInitialState,
  reset: () => set(SurveyEditorFormStoreInitialState),

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
