import { create } from 'zustand';
import { AxiosError } from 'axios';
import handleApiError from '@/utils/handleApiError';
import getUserAnswer from '@/pages/PollsAndSurveysPage/Surveys/components/dto/get-user-answer.dto';
import getSurveyAnswers from '@/pages/PollsAndSurveysPage/Surveys/components/dto/get-survey-answers.dto';

interface ShowSurveyAnswerDialogStore {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;

  answer: string | undefined;
  answers: JSON[] | undefined;
  getSurveyAnswer: (surveyname: string | undefined) => Promise<string | undefined>;
  getAllSurveyAnswers: (surveyname: string | undefined) => Promise<JSON[] | undefined>;
}

const initialState: Partial<ShowSurveyAnswerDialogStore> = {
  answer: undefined,
  answers: undefined,
  isLoading: false,
  error: null,
};

const useShowSurveyAnswerDialogStore = create<ShowSurveyAnswerDialogStore>((set) => ({
  ...(initialState as ShowSurveyAnswerDialogStore),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  getSurveyAnswer: async (surveyName: string | undefined): Promise<string | undefined> => {
    if (!surveyName) {
      return undefined;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await getUserAnswer({ surveyName });
      set({ answer: response });
      return response;
    } catch (error) {
      set({ answer: undefined });
      handleApiError(error, set);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  getAllSurveyAnswers: async (surveyName: string | undefined): Promise<JSON[] | undefined> => {
    if (!surveyName) {
      return undefined;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await getSurveyAnswers({ surveyName });
      set({ answers: response });
      return response;
    } catch (error) {
      set({ answer: undefined });
      handleApiError(error, set);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useShowSurveyAnswerDialogStore;
