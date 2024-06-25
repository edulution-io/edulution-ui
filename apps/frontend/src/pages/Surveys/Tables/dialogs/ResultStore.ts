import mongoose from 'mongoose';
import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import Survey from '@libs/survey/types/survey';
import Attendee from '@libs/survey/types/attendee';
import { SURVEY_RESULT_ENDPOINT } from '@libs/survey/surveys-endpoint';

interface ResultStore {
  selectedSurvey: Survey | undefined;
  selectSurvey: (survey: Survey | undefined) => void;

  isOpenPublicResultsTableDialog: boolean;
  openPublicResultsTableDialog: () => void;
  closePublicResultsTableDialog: () => void;
  isOpenPublicResultsVisualisationDialog: boolean;
  openPublicResultsVisualisationDialog: () => void;
  closePublicResultsVisualisationDialog: () => void;
  getSurveyResult: (surveyId: mongoose.Types.ObjectId, participants: Attendee[]) => Promise<JSON[] | undefined>;
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

const useResultStore = create<ResultStore>((set) => ({
  ...(initialState as ResultStore),
  reset: () => set(initialState),

  selectSurvey: (survey: Survey | undefined) => set({ selectedSurvey: survey }),

  openPublicResultsTableDialog: () => set({ isOpenPublicResultsTableDialog: true }),
  closePublicResultsTableDialog: () => set({ isOpenPublicResultsTableDialog: false }),
  openPublicResultsVisualisationDialog: () => set({ isOpenPublicResultsVisualisationDialog: true }),
  closePublicResultsVisualisationDialog: () => set({ isOpenPublicResultsVisualisationDialog: false }),
  getSurveyResult: async (surveyId: mongoose.Types.ObjectId, participants: Attendee[]): Promise<JSON[]> => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<JSON[]>(SURVEY_RESULT_ENDPOINT, {
        params: {
          surveyId,
        },
        data: {
          surveyId,
          participants,
          isAnonymous: false,
        },
      });
      const result = response.data;
      set({ result, isLoading: false });
      return result;
    } catch (error) {
      set({ error: error as AxiosError, result: undefined, isLoading: false });
      return [];
    }
  },
}));

export default useResultStore;
