import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import SURVEY_ENDPOINT from '@/pages/Surveys/components/dto/survey-endpoint.dto';
import UsersSurveysTypes from '@/pages/Surveys/components/types/users-surveys-table-type';

interface ShowSurveyAnswerDialogStore {
  isOpenSurveyAnswerDialog: boolean;
  openSurveyAnswerDialog: () => void;
  closeSurveyAnswerDialog: () => void;

  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;

  answer: string | undefined;
  getSurveyAnswer: (surveyname: string | undefined) => Promise<string | undefined>;
}

const initialState: Partial<ShowSurveyAnswerDialogStore> = {
  isOpenSurveyAnswerDialog: false,
  answer: undefined,
  isLoading: false,
  error: null,
};

const useShowSurveyAnswerDialogStore = create<ShowSurveyAnswerDialogStore>((set) => ({
  ...(initialState as ShowSurveyAnswerDialogStore),
  openSurveyAnswerDialog: () => set({ isOpenSurveyAnswerDialog: true }),
  closeSurveyAnswerDialog: () => set({ isOpenSurveyAnswerDialog: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  getSurveyAnswer: async (surveyName: string | undefined): Promise<string | undefined> => {
    if (!surveyName) {
      return undefined;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<string>(SURVEY_ENDPOINT, {
        params: { search: UsersSurveysTypes.ANSWER, surveyname: surveyName },
      });
      const answer = response.data;
      set({ answer, isLoading: false });
      return answer;
    } catch (error) {
      set({ answer: undefined, error, isLoading: false });
    }
  },
}));

export default useShowSurveyAnswerDialogStore;
