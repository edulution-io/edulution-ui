import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import SURVEY_ENDPOINT from '@/pages/Surveys/components/dto/survey-endpoint.dto';
import UsersSurveysTypes from '@/pages/Surveys/components/types/users-surveys-table-type';

interface ShowSurveyResultsDialogStore {
  isOpenSurveyResultsDialog: boolean;
  openSurveyResultsDialog: () => void;
  closeSurveyResultsDialog: () => void;

  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;

  answers: JSON[];
  getAllSurveyAnswers: (surveyname: string, participants: Attendee[]) => Promise<JSON[] | undefined>;
}

const initialState: Partial<ShowSurveyResultsDialogStore> = {
  isOpenSurveyResultsDialog: false,
  answers: undefined,
  isLoading: false,
  error: null,
};

const useShowSurveyResultsDialogStore = create<ShowSurveyResultsDialogStore>((set) => ({
  ...(initialState as ShowSurveyResultsDialogStore),
  openSurveyResultsDialog: () => set({ isOpenSurveyResultsDialog: true }),
  closeSurveyResultsDialog: () => set({ isOpenSurveyResultsDialog: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  getAllSurveyAnswers: async (surveyName: string, participants: Attendee[]): Promise<JSON[] | undefined> => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<JSON[]>(SURVEY_ENDPOINT, {
        params: { search: UsersSurveysTypes.ANSWER, surveyname: surveyName },
        data: { participants: participants, isAnonymous: false },
      });
      const answers = response.data;
      set({ answers, isLoading: false });
      return answers;
    } catch (error) {
      set({ error: error, answers: undefined, isLoading: false });
    }
  },
}));

export default useShowSurveyResultsDialogStore;
