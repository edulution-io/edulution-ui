import mongoose from 'mongoose';
import { create } from 'zustand';
import { AxiosError } from 'axios';
import SurveyDto from '@libs/survey/types/survey.dto';
import { SURVEY_RESULT_ENDPOINT } from '@libs/survey/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface ResultDialogStore {
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  isOpenPublicResultsTableDialog: boolean;
  setIsOpenPublicResultsTableDialog: (state: boolean) => void;
  isOpenPublicResultsVisualisationDialog: boolean;
  setIsOpenPublicResultsVisualisationDialog: (state: boolean) => void;
  getSurveyResult: (surveyId: mongoose.Types.ObjectId) => Promise<void>;
  result: JSON[];
  isLoading: boolean;
  error: Error | null;

  reset: () => void;
}

const initialState: Partial<ResultDialogStore> = {
  selectedSurvey: undefined,
  isOpenPublicResultsTableDialog: false,
  isOpenPublicResultsVisualisationDialog: false,
  result: undefined,
  isLoading: false,
  error: null,
};

const useResultDialogStore = create<ResultDialogStore>((set) => ({
  ...(initialState as ResultDialogStore),
  reset: () => set(initialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  setIsOpenPublicResultsTableDialog: (state: boolean) => set({ isOpenPublicResultsTableDialog: state }),
  setIsOpenPublicResultsVisualisationDialog: (state: boolean) => set({ isOpenPublicResultsVisualisationDialog: state }),

  getSurveyResult: async (surveyId: mongoose.Types.ObjectId): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<JSON[]>(`${SURVEY_RESULT_ENDPOINT}${surveyId.toString('base64')}`);
      const result = response.data;
      set({ result, isLoading: false });
    } catch (error) {
      handleApiError(error, set);
      set({ result: undefined, error: error instanceof AxiosError ? error : null, isLoading: false });
    }
  },
}));

export default useResultDialogStore;
