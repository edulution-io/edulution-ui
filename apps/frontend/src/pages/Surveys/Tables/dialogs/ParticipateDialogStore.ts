import mongoose from 'mongoose';
import { create } from 'zustand';
import { CompleteEvent } from 'survey-core';
import { AxiosError } from 'axios';
import SURVEYS_ENDPOINT from '@libs/survey/surveys-endpoint';
import Survey from '@libs/survey/types/survey';
import eduApi from '@/api/eduApi';

interface ParticipateDialogStore {
  selectedSurvey: Survey | undefined;
  selectSurvey: (survey: Survey | undefined) => void;

  isOpenParticipateSurveyDialog: boolean;
  openParticipateSurveyDialog: () => void;
  closeParticipateSurveyDialog: () => void;
  pushAnswer: (surveyId: mongoose.Types.ObjectId, answer: JSON, options?: CompleteEvent) => Promise<string>;
  isLoading: boolean;
  error: Error | null;

  reset: () => void;
}

const initialState: Partial<ParticipateDialogStore> = {
  selectedSurvey: undefined,
  isOpenParticipateSurveyDialog: false,
  isLoading: false,
  error: null,
};

const useParticipateDialogStore = create<ParticipateDialogStore>((set) => ({
  ...(initialState as ParticipateDialogStore),
  reset: () => set(initialState),

  selectSurvey: (survey: Survey | undefined) => set({ selectedSurvey: survey }),

  openParticipateSurveyDialog: () => set({ isOpenParticipateSurveyDialog: true }),
  closeParticipateSurveyDialog: () => set({ isOpenParticipateSurveyDialog: false }),
  pushAnswer: async (surveyId: mongoose.Types.ObjectId, answer: JSON, options?: CompleteEvent): Promise<string> => {
    set({ error: null, isLoading: true });
    try {
      // Display the "Saving..." message (pass a string value to display a custom message)
      options?.showSaveInProgress();

      const response = await eduApi.patch<string>(SURVEYS_ENDPOINT, {
        surveyId,
        answer,
      });

      // Display the "Success" message (pass a string value to display a custom message)
      options?.showSaveSuccess();

      set({ isLoading: false });
      return response.data;
    } catch (error) {
      // Display the "Error" message (pass a string value to display a custom message)
      options?.showSaveError();

      set({ error: error as AxiosError, isLoading: false });
      return '';
    }
  },
}));

export default useParticipateDialogStore;
