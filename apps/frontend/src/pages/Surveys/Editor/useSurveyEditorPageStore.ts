import { create } from 'zustand';
import SurveyEditorPageStore from '@libs/survey/types/editor/surveyEditorPageStore';
import SurveyEditorPageStoreInitialState from '@libs/survey/types/editor/surveyEditorPageStoreInitialState';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SURVEYS_ENDPOINT from '@libs/survey/constants/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

const useSurveyEditorPageStore = create<SurveyEditorPageStore>((set) => ({
  ...SurveyEditorPageStoreInitialState,
  reset: () => set(SurveyEditorPageStoreInitialState),

  setSurvey: (survey: SurveyDto | undefined) => set({ survey }),

  setIsOpenSaveSurveyDialog: (state: boolean) => set({ isOpenSaveSurveyDialog: state }),

  updateOrCreateSurvey: async (survey: SurveyDto): Promise<void> => {
    set({ isLoading: true });
    try {
      const result = await eduApi.post<SurveyDto>(SURVEYS_ENDPOINT, survey);
      const resultingSurvey = result.data;
      if (resultingSurvey && survey.isPublic) {
        set({
          isOpenSharePublicSurveyDialog: true,
          publicSurveyId: resultingSurvey.id.toString('hex'),
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
