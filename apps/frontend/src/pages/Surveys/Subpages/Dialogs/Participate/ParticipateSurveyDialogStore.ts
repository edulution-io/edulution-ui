import { create } from 'zustand';
import { AxiosError } from 'axios';
import { CompleteEvent } from 'survey-core';
import eduApi from '@/api/eduApi.ts';
import SURVEY_ENDPOINT from '@/pages/Surveys/Subpages/components/survey-endpoint.ts';

interface ParticipateSurveyDialogStore {
  isOpenParticipateSurveyDialog: boolean;
  openParticipateSurveyDialog: () => void;
  closeParticipateSurveyDialog: () => void;

  isAnswering: boolean;
  setIsAnswering: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;

  commitAnswer: (surveyName: string, answer: string, options?: CompleteEvent) => void;
}

const initialState: Partial<ParticipateSurveyDialogStore> = {
  isOpenParticipateSurveyDialog: false,
  isAnswering: false,
  error: null,
};

const useParticipateSurveyDialogStore = create<ParticipateSurveyDialogStore>((set) => ({
  ...(initialState as ParticipateSurveyDialogStore),
  openParticipateSurveyDialog: () => set({ isOpenParticipateSurveyDialog: true }),
  closeParticipateSurveyDialog: () => set({ isOpenParticipateSurveyDialog: false }),
  setIsAnswering: (isAnswering) => set({ isAnswering }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  commitAnswer: async (surveyName: string, answer: string, options?: CompleteEvent): Promise<string> => {
    set({ error: null, isAnswering: true });
    try {
      // Display the "Saving..." message (pass a string value to display a custom message)
      options?.showSaveInProgress();

      const response = await eduApi.patch<string>(SURVEY_ENDPOINT, {
        surveyname: surveyName,
        answer,
      });

      // Display the "Success" message (pass a string value to display a custom message)
      options?.showSaveSuccess();

      return response.data;
    } catch (error) {
      // Display the "Error" message (pass a string value to display a custom message)
      options?.showSaveError();

      set({ error, isAnswering: false });
      return '';
    }
  },
}));

export default useParticipateSurveyDialogStore;
