import { create } from 'zustand';
import SURVEYS_ENDPOINT from '@libs/survey/constants/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface DeleteSurveyStore {
  deleteSurveys: (surveyIds: string[]) => Promise<void>;
  isLoading: boolean;

  reset: () => void;
}

const DeleteSurveyStoreInitialState: Partial<DeleteSurveyStore> = {
  isLoading: false,
};

const useDeleteSurveyStore = create<DeleteSurveyStore>((set) => ({
  ...(DeleteSurveyStoreInitialState as DeleteSurveyStore),
  reset: () => set(DeleteSurveyStoreInitialState),

  deleteSurveys: async (surveyIds: string[]): Promise<void> => {
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
