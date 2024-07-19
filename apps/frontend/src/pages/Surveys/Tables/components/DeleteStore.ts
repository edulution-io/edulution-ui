import mongoose from 'mongoose';
import { create } from 'zustand';
import { AxiosError } from 'axios';
import SURVEYS_ENDPOINT from '@libs/survey/surveys-endpoint';
import SurveysPageView from '@libs/survey/types/page-view';
import SurveyDto from '@libs/survey/types/survey.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface DeleteSurveyStore {
  updateSelectedPageView: (pageView: SurveysPageView) => void;
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  deleteSurvey: (surveyIds: mongoose.Types.ObjectId[]) => Promise<void>;
  isLoading: boolean;
  error: Error | null;

  reset: () => void;
}

const initialState: Partial<DeleteSurveyStore> = {
  selectedSurvey: undefined,
  isLoading: false,
  error: null,
};

const useDeleteStore = create<DeleteSurveyStore>((set) => ({
  ...(initialState as DeleteSurveyStore),
  reset: () => set(initialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  deleteSurvey: async (surveyIds: mongoose.Types.ObjectId[]): Promise<void> => {
    set({ error: null, isLoading: true });
    try {
      await eduApi.delete(SURVEYS_ENDPOINT, { data: { surveyIds } });
      set({ isLoading: false });
    } catch (error) {
      set({ error: error instanceof AxiosError ? error : null, isLoading: false });
      handleApiError(error, set);
      throw error;
    }
  },
}));

export default useDeleteStore;
