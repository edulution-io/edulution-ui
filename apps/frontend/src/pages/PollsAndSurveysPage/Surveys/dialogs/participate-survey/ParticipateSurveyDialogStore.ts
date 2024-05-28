import { create } from 'zustand';
import { AxiosError } from 'axios';
import { CompleteEvent } from 'survey-core';
import handleApiError from '@/utils/handleApiError';
import pushAnswer from '@/pages/PollsAndSurveysPage/Surveys/components/dto/push-answer.dto';

interface ParticipateSurveyDialogStore {
  isAnswering: boolean;
  setIsAnswering: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;

  commitAnswer: (surveyName: string, answer: string, options?: CompleteEvent) => void;
}

const initialState: Partial<ParticipateSurveyDialogStore> = {
  isAnswering: false,
  error: null,
};

const useParticipateSurveyDialogStore = create<ParticipateSurveyDialogStore>((set) => ({
  ...(initialState as ParticipateSurveyDialogStore),
  setIsAnswering: (isAnswering) => set({ isAnswering }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  commitAnswer: async (surveyName: string, answer: string, options?: CompleteEvent): Promise<void> => {
    set({ isAnswering: true });
    try {
      await pushAnswer(surveyName, answer, options);
    } catch (error) {
      handleApiError(error, set);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
    } finally {
      set({ isAnswering: false });
    }
  },
}));

export default useParticipateSurveyDialogStore;
