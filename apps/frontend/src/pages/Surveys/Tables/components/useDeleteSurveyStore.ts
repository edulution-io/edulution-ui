import { create } from 'zustand';
import SURVEYS_ENDPOINT from '@libs/survey/constants/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface DeleteSurveyStore {
  isDeleteSurveysDialogOpen: boolean;
  selectedSurveyIds: string[];
  openDeleteSurveyDialog: (surveyIds: string[]) => void;
  abortDeleteSurvey: () => void;
  confirmDeleteSurvey: () => Promise<void>;

  isLoading: boolean;

  reset: () => void;
}

const DeleteSurveyStoreInitialState: Partial<DeleteSurveyStore> = {
  isDeleteSurveysDialogOpen: false,
  selectedSurveyIds: [],
  isLoading: false,
};

const useDeleteSurveyStore = create<DeleteSurveyStore>((set, get) => ({
  ...(DeleteSurveyStoreInitialState as DeleteSurveyStore),
  reset: () => set(DeleteSurveyStoreInitialState),

  openDeleteSurveyDialog: (surveyIds: string[]) => {
    set({ isDeleteSurveysDialogOpen: true, selectedSurveyIds: surveyIds });
  },
  abortDeleteSurvey: () => set({ isDeleteSurveysDialogOpen: false }),

  confirmDeleteSurvey: async () => {
    const { selectedSurveyIds } = get();
    set({ isLoading: true });
    try {
      await eduApi.delete(SURVEYS_ENDPOINT, { data: { selectedSurveyIds } });
      set({ isDeleteSurveysDialogOpen: false });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useDeleteSurveyStore;
