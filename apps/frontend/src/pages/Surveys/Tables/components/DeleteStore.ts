import { create } from 'zustand';
import { AxiosError } from 'axios';
import SURVEYS_ENDPOINT from '@libs/survey/utils/surveys-endpoint';
import SurveysPageView from '@libs/survey/types/page-view';
import Survey from '@libs/survey/types/survey';
import eduApi from '@/api/eduApi';
import handleApiError from "@/utils/handleApiError";

interface DeleteStore {
  updateSelectedPageView: (pageView: SurveysPageView) => void;
  selectedSurvey: Survey | undefined;
  selectSurvey: (survey: Survey | undefined) => void;

  deleteSurvey: (id: number) => Promise<void>;
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

  deleteSurvey: async (surveyID: number): Promise<void> => {
    set({ error: null, isLoading: true });
    try {
      await eduApi.delete(SURVEYS_ENDPOINT, { params: { id: surveyID } });
      set({ isLoading: false });
    } catch (error) {
      handleApiError(error as AxiosError, set)
      set({ error: error as AxiosError, isLoading: false });
      throw error;
    }
  },
}));

export default useDeleteStore;
