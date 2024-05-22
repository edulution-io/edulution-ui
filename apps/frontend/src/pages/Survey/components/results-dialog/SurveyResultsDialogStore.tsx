import { create } from 'zustand';
import { AxiosError } from 'axios';
import handleApiError from '@/utils/handleApiError';
import { Survey, SurveyAnswer } from '@/pages/Survey/backend-copy/model';
import getUserAnswer from '@/pages/Survey/components/dto/get-user-answer.dto';

interface SurveyResultsDialogStore {
  isSurveyResultsDialogOpen: boolean;
  openSurveyResultsDialog: () => void;
  closeSurveyResultsDialog: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;

  survey: Survey;
  setSurvey: (survey: Survey) => void;

  surveyAnswer: SurveyAnswer | undefined;
  getSurveyAnswer: (surveyname: string) => Promise<SurveyAnswer | undefined>;
}

const initialState: Partial<SurveyResultsDialogStore> = {
  isSurveyResultsDialogOpen: false,
  isLoading: false,
  error: null,
};

const useSurveyResultsDialogStore = create<SurveyResultsDialogStore>((set) => ({
  ...(initialState as SurveyResultsDialogStore),
  setSurvey: (survey) => set({ survey }),
  openSurveyResultsDialog: () => set({ isSurveyResultsDialogOpen: true }),
  closeSurveyResultsDialog: () => set({ isSurveyResultsDialogOpen: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  getSurveyAnswer: async (surveyName: string): Promise<SurveyAnswer | undefined> => {
    set({ isLoading: true, error: null });
    try {
      const response = await getUserAnswer({ surveyName });
      set({ surveyAnswer: response });
      return response;
    } catch (error) {
      handleApiError(error, set);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useSurveyResultsDialogStore;
