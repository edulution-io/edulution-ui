import mongoose from 'mongoose';
import { create } from 'zustand';
import { CompleteEvent } from 'survey-core';
import SURVEYS_ENDPOINT from '@libs/survey/surveys-endpoint';
import SurveyDto from '@libs/survey/types/survey.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface ParticipateDialogStore {
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  isOpenParticipateSurveyDialog: boolean;
  setIsOpenParticipateSurveyDialog: (state: boolean) => void;
  answerSurvey: (surveyId: mongoose.Types.ObjectId, answer: JSON, options?: CompleteEvent) => Promise<void>;
  isLoading: boolean;

  reset: () => void;
}

const initialState: Partial<ParticipateDialogStore> = {
  selectedSurvey: undefined,
  isOpenParticipateSurveyDialog: false,
  isLoading: false,
};

const useParticipateDialogStore = create<ParticipateDialogStore>((set) => ({
  ...(initialState as ParticipateDialogStore),
  reset: () => set(initialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  setIsOpenParticipateSurveyDialog: (state: boolean) => set({ isOpenParticipateSurveyDialog: state }),
  answerSurvey: async (surveyId: mongoose.Types.ObjectId, answer: JSON, options?: CompleteEvent): Promise<void> => {
    set({ isLoading: true });
    try {
      // Display the "Saving..." message (pass a string value to display a custom message)
      options?.showSaveInProgress();
      await eduApi.patch<string>(SURVEYS_ENDPOINT, {
        surveyId,
        answer,
      });

      // Display the "Success" message (pass a string value to display a custom message)
      options?.showSaveSuccess();

      set({ isLoading: false });
    } catch (error) {
      // Display the "Error" message (pass a string value to display a custom message)
      options?.showSaveError();
      set({ isLoading: false });
      handleApiError(error, set);
    }
  },
}));

export default useParticipateDialogStore;
