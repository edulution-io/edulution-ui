import mongoose from 'mongoose';
import { create } from 'zustand';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import SURVEYS_ENDPOINT from '@libs/survey/surveys-endpoint';
import SurveysPageView from '@libs/survey/types/page-view';
import Survey from '@libs/survey/types/survey';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface DeleteStore {
  updateSelectedPageView: (pageView: SurveysPageView) => void;
  selectedSurvey: Survey | undefined;
  selectSurvey: (survey: Survey | undefined) => void;

  deleteSurvey: (id: mongoose.Types.ObjectId) => Promise<void>;
  isLoading: boolean;
  error: Error | null;

  reset: () => void;
}

const initialState: Partial<DeleteStore> = {
  selectedSurvey: undefined,
  isLoading: false,
  error: null,
};

const useDeleteStore = create<DeleteStore>((set) => ({
  ...(initialState as DeleteStore),
  reset: () => set(initialState),

  selectSurvey: (survey: Survey | undefined) => set({ selectedSurvey: survey }),

  deleteSurvey: async (surveyID: mongoose.Types.ObjectId): Promise<void> => {
    set({ error: null, isLoading: true });
    try {
      await eduApi.delete(SURVEYS_ENDPOINT, { params: { id: surveyID } });
      set({ isLoading: false });
    } catch (error) {
      set({ error: error instanceof AxiosError ? error : null, isLoading: false });
      toast.error(
        error instanceof AxiosError ? `${error.name}: ${error.message}` : 'Error while posting the answer for a survey',
      );
      handleApiError(error, set);
      throw error;
    }
  },
}));

export default useDeleteStore;
