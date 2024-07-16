import mongoose from 'mongoose';
import { create } from 'zustand';
import { CompleteEvent } from 'survey-core';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import SURVEYS_ENDPOINT from '@libs/survey/surveys-endpoint';
import SurveyDto from '@libs/survey/types/survey.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface ParticipateDialogStore {
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  isOpenParticipateSurveyDialog: boolean;
  openParticipateSurveyDialog: () => void;
  closeParticipateSurveyDialog: () => void;
  answerSurvey: (surveyId: mongoose.Types.ObjectId, answer: JSON, options?: CompleteEvent) => Promise<string>;
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

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  openParticipateSurveyDialog: () => set({ isOpenParticipateSurveyDialog: true }),
  closeParticipateSurveyDialog: () => set({ isOpenParticipateSurveyDialog: false }),
  answerSurvey: async (surveyId: mongoose.Types.ObjectId, answer: JSON, options?: CompleteEvent): Promise<string> => {
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

      set({ error: error instanceof AxiosError ? error : null, isLoading: false });
      toast.error(
        error instanceof AxiosError ? `${error.name}: ${error.message}` : 'Error while posting the answer for a survey',
      );
      handleApiError(error, set);
      return '';
    }
  },
}));

export default useParticipateDialogStore;
