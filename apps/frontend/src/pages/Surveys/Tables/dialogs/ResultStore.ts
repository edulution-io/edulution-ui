import { create } from 'zustand';
import { AxiosError } from 'axios';
import SURVEYS_ENDPOINT from '@libs/survey/utils/surveys-endpoint';
import Attendee from '@libs/conferences/types/attendee';
import Survey from '@libs/survey/types/survey';
import { EMPTY_JSON } from '@libs/survey/utils/empty-json';
import eduApi from '@/api/eduApi';

interface ResultStore {
  selectedSurvey: Survey | undefined;
  selectSurvey: (survey: Survey | undefined) => void;

  isOpenPublicResultsTableDialog: boolean;
  openPublicResultsTableDialog: () => void;
  closePublicResultsTableDialog: () => void;
  isOpenPublicResultsVisualisationDialog: boolean;
  openPublicResultsVisualisationDialog: () => void;
  closePublicResultsVisualisationDialog: () => void;
  getSurveyResult: (surveyId: number, participants: Attendee[]) => Promise<JSON[] | undefined>;
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
  getSurveyResult: async (surveyId: number, participants: Attendee[]): Promise<JSON[]> => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<JSON[]>(SURVEYS_ENDPOINT, {
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
      return [EMPTY_JSON];
    }
  },
}));

export default useResultStore;
