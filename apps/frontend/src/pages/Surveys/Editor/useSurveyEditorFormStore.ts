import { create } from 'zustand';
import SurveyEditorFormStore from '@libs/survey/types/editor/surveyEditorFormStore';
import SurveyEditorFormStoreInitialState from '@libs/survey/types/editor/surveyEditorFormStoreInitialState';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SURVEYS_ENDPOINT from '@libs/survey/constants/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

const useSurveyEditorFormStore = create<SurveyEditorFormStore>((set) => ({
  ...SurveyEditorFormStoreInitialState,
  reset: () => set(SurveyEditorFormStoreInitialState),

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
        set({ isOpenSharePublicSurveyDialog: false, publicSurveyId: '' });
      }
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  closeSharePublicSurveyDialog: () =>
    set({ isOpenSaveSurveyDialog: false, publicSurveyId: SurveyEditorFormStoreInitialState.publicSurveyId }),
}));

export default useSurveyEditorFormStore;
