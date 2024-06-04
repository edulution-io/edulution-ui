import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import SURVEY_ENDPOINT from '@/pages/Surveys/Subpages/components/survey-endpoint.ts';
import UsersSurveysTypes from '@/pages/Surveys/Subpages/components/types/users-surveys-table-type';

interface ShowSurveyResultsTableDialogStore {
  isOpenSurveyResultsTableDialog: boolean;
  openSurveyResultsTableDialog: () => void;
  closeSurveyResultsTableDialog: () => void;

  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;

  answers: string[];
  getAllSurveyAnswers: (surveyname: string, participants: Attendee[]) => Promise<string[] | undefined>;
}

const initialState: Partial<ShowSurveyResultsTableDialogStore> = {
  isOpenSurveyResultsTableDialog: false,
  answers: undefined,
  isLoading: false,
  error: null,
};

const useShowSurveyResultsTableDialogStore = create<ShowSurveyResultsTableDialogStore>((set) => ({
  ...(initialState as ShowSurveyResultsTableDialogStore),
  openSurveyResultsDialog: () => set({ isOpenSurveyResultsTableDialog: true }),
  closeSurveyResultsDialog: () => set({ isOpenSurveyResultsTableDialog: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  getAllSurveyAnswers: async (surveyName: string, participants: Attendee[]): Promise<string[] | undefined> => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<string[]>(SURVEY_ENDPOINT, {
        params: { search: UsersSurveysTypes.ANSWERS, surveyname: surveyName, participants: participants, isAnonymous: false },
      });
      const answers = response.data;
      set({ answers, isLoading: false });
      return answers;
    } catch (error) {
      set({ error: error, answers: undefined, isLoading: false });
    }
  },
}));

export default useShowSurveyResultsTableDialogStore;
