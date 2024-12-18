import { create } from 'zustand';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface SurveyEditorPageStore {
  survey: SurveyDto | undefined;
  setSurvey: (survey: SurveyDto | undefined) => void;

  isOpenSaveSurveyDialog: boolean;
  setIsOpenSaveSurveyDialog: (state: boolean) => void;
  updateOrCreateSurvey: (survey: SurveyDto) => Promise<void>;
  isLoading: boolean;

  isOpenSharePublicSurveyDialog: boolean;
  publicSurveyId: string;
  closeSharePublicSurveyDialog: () => void;

  reset: () => void;
}

const SurveyEditorPageStoreInitialState = {
  survey: undefined,

  isOpenSaveSurveyDialog: false,
  isLoading: false,

  isOpenSharePublicSurveyDialog: false,
  publicSurveyId: '',
};

const useSurveyEditorPageStore = create<SurveyEditorPageStore>((set) => ({
  ...SurveyEditorPageStoreInitialState,
  reset: () => set(SurveyEditorPageStoreInitialState),

  setSurvey: (survey: SurveyDto | undefined) => set({ survey }),

  setIsOpenSaveSurveyDialog: (state: boolean) => set({ isOpenSaveSurveyDialog: state }),

  updateOrCreateSurvey: async (survey: SurveyDto): Promise<void> => {
    set({ isLoading: true });
    try {
      const result = await eduApi.post<SurveyDto>(SURVEYS, survey);
      const resultingSurvey = result.data;
      if (resultingSurvey && survey.isPublic) {
        set({
          isOpenSharePublicSurveyDialog: true,
          publicSurveyId: resultingSurvey.id.toString(),
        });
      } else {
        set({ isOpenSharePublicSurveyDialog: false, publicSurveyId: undefined });
      }
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  closeSharePublicSurveyDialog: () =>
    set({ isOpenSaveSurveyDialog: false, publicSurveyId: SurveyEditorPageStoreInitialState.publicSurveyId }),
}));

export default useSurveyEditorPageStore;
