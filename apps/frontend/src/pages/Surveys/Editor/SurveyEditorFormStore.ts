import { create } from 'zustand';
import SurveyDto from '@libs/survey/types/survey.dto';
import SURVEYS_ENDPOINT from '@libs/survey/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface SurveyEditorFormStore {
  isOpenSaveSurveyDialog: boolean;
  setIsOpenSaveSurveyDialog: (state: boolean) => void;
  updateOrCreateSurvey: (survey: SurveyDto) => Promise<void>;
  isLoading: boolean;
  reset: () => void;
}

const initialState = {
  isOpenSaveSurveyDialog: false,
  isLoading: false,
};

const useSurveyEditorFormStore = create<SurveyEditorFormStore>((set) => ({
  ...initialState,
  reset: () => set(initialState),

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
