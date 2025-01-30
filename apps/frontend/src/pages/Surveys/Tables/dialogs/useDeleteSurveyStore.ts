import { create } from 'zustand';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface DeleteSurveyStore {
  isDeleteSurveysDialogOpen: boolean;
  setIsDeleteSurveysDialogOpen: (isOpen: boolean) => void;
  deleteSurveys: (surveys: SurveyDto[]) => Promise<void>;
  isLoading: boolean;
  reset: () => void;
  error?: Error;
}

const DeleteSurveyStoreInitialState: Partial<DeleteSurveyStore> = {
  isDeleteSurveysDialogOpen: false,
  isLoading: false,
  error: undefined,
};

const useDeleteSurveyStore = create<DeleteSurveyStore>((set) => ({
  ...(DeleteSurveyStoreInitialState as DeleteSurveyStore),
  reset: () => set(DeleteSurveyStoreInitialState),

  setIsDeleteSurveysDialogOpen: (isOpen) => set({ isDeleteSurveysDialogOpen: isOpen }),
  deleteSurveys: async (surveys: SurveyDto[]) => {
    set({ isLoading: true });
    try {
      await eduApi.delete(SURVEYS, {
        data: { surveyIds: surveys.map((survey) => survey.id) },
      });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useDeleteSurveyStore;
