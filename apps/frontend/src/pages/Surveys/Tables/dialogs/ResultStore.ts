import mongoose from 'mongoose';
import { create } from 'zustand';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import SurveyDto from '@libs/survey/types/survey.dto';
import { SURVEY_RESULT_ENDPOINT } from '@libs/survey/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface ResultStore {
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  isOpenPublicResultsTableDialog: boolean;
  openPublicResultsTableDialog: () => void;
  closePublicResultsTableDialog: () => void;
  isOpenPublicResultsVisualisationDialog: boolean;
  openPublicResultsVisualisationDialog: () => void;
  closePublicResultsVisualisationDialog: () => void;
  getSurveyResult: (surveyId: mongoose.Types.ObjectId) => Promise<JSON[] | undefined>;
  result: JSON[];
  isLoading: boolean;
  error: Error | null;

  reset: () => void;
}

const initialState: Partial<ResultStore> = {
  selectedSurvey: undefined,
  isOpenPublicResultsTableDialog: false,
  isOpenPublicResultsVisualisationDialog: false,
  result: undefined,
  isLoading: false,
  error: null,
};

const useResultStore = create<ResultStore>((set, get) => ({
  ...(initialState as ResultStore),
  reset: () => set(initialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  openPublicResultsTableDialog: () => set({ isOpenPublicResultsTableDialog: true }),
  closePublicResultsTableDialog: () => set({ isOpenPublicResultsTableDialog: false }),
  openPublicResultsVisualisationDialog: () => set({ isOpenPublicResultsVisualisationDialog: true }),
  closePublicResultsVisualisationDialog: () => set({ isOpenPublicResultsVisualisationDialog: false }),
  getSurveyResult: async (surveyId: mongoose.Types.ObjectId): Promise<JSON[]> => {
    const { isOpenPublicResultsTableDialog, isOpenPublicResultsVisualisationDialog } = get();
    if (!isOpenPublicResultsTableDialog && !isOpenPublicResultsVisualisationDialog) {
      return [];
    }
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<JSON[]>(`${SURVEY_RESULT_ENDPOINT}${surveyId.toString('base64')}`);
      const result = response.data;
      set({ result, isLoading: false });
      return result;
    } catch (error) {
      toast.error(
        error instanceof AxiosError ? `${error.name}: ${error.message}` : 'Error while fetching the survey results',
      );
      handleApiError(error, set);
      set({ result: undefined, error: error instanceof AxiosError ? error : null, isLoading: false });
      return [];
    }
  },
}));

export default useResultStore;
