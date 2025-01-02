import { create } from 'zustand';
import SURVEYS_ENDPOINT from '@libs/survey/constants/surveys-endpoint';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import DeleteSurveyStore from '@libs/survey/types/tables/deleteSurveyStore';
import DeleteSurveyStoreInitialState from '@libs/survey/types/tables/deleteSurveyStoreInitialState';

const useDeleteSurveyStore = create<DeleteSurveyStore>((set) => ({
  ...(DeleteSurveyStoreInitialState as DeleteSurveyStore),
  reset: () => set(DeleteSurveyStoreInitialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  deleteSurvey: async (surveyIds: string[]): Promise<void> => {
    set({ isLoading: true });
    try {
      await eduApi.delete(SURVEYS_ENDPOINT, { data: { surveyIds } });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useDeleteSurveyStore;
