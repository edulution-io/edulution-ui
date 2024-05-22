import { create } from 'zustand';
import { AxiosError } from 'axios';
import { CompleteEvent } from 'survey-core';
import handleApiError from '@/utils/handleApiError';
import { Survey } from '@/pages/Survey/backend-copy/model';
import pushAnswer from '@/pages/Survey/components/dto/push-answer.dto';

interface ParticipateSurveyDialogStore {
  isParticipateSurveyDialogOpen: boolean;
  openParticipateSurveyDialog: () => void;
  closeParticipateSurveyDialog: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;

  participatingSurvey: Survey | undefined;
  setParticipatingSurvey: (survey: Survey | undefined) => void;

  answerSurvey: (surveyName: string, answer: string, options?: CompleteEvent) => void;
  success: boolean | undefined;
  setSuccess: (success: boolean) => void;
}

const initialState: Partial<ParticipateSurveyDialogStore> = {
  isParticipateSurveyDialogOpen: false,
  isLoading: false,
  error: null,
  success: undefined,
};

const useParticipateSurveyDialogStore = create<ParticipateSurveyDialogStore>((set) => ({
  ...(initialState as ParticipateSurveyDialogStore),
  setParticipatingSurvey: (survey) => set({ participatingSurvey: survey }),
  openParticipateSurveyDialog: () => set({ isParticipateSurveyDialogOpen: true }),
  closeParticipateSurveyDialog: () => set({ isParticipateSurveyDialogOpen: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  answerSurvey: async (surveyName: string, answer: string, options?: CompleteEvent): Promise<void> => {
    set({ isLoading: true });
    try {
      await pushAnswer(surveyName, answer, options);
    } catch (error) {
      handleApiError(error, set);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useParticipateSurveyDialogStore;
