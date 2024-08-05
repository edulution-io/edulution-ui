import mongoose from 'mongoose';
import { create } from 'zustand';
import { CompleteEvent } from 'survey-core';
import SURVEYS_ENDPOINT from '@libs/survey/surveys-endpoint';
import SurveyDto from '@libs/survey/types/survey.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import ParticipateDialogStoreInitialState from '@/pages/Surveys/Tables/dialogs/participate-survey/participateDialogStoreInitialState';
import ParticipateDialogStore from './participateDialogStore';

const useParticipateDialogStore = create<ParticipateDialogStore>((set) => ({
  ...(ParticipateDialogStoreInitialState as ParticipateDialogStore),
  reset: () => set(ParticipateDialogStoreInitialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),
  setAnswer: (answer: JSON | undefined) => set({ answer }),

  setIsOpenParticipateSurveyDialog: (state: boolean) => set({ isOpenParticipateSurveyDialog: state }),
  answerSurvey: async (
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
    surveyEditorCallbackOnSave?: CompleteEvent,
  ): Promise<void> => {
    set({ isLoading: true });
    try {
      surveyEditorCallbackOnSave?.showSaveInProgress();
      await eduApi.patch<string>(SURVEYS_ENDPOINT, {
        surveyId,
        saveNo,
        answer,
      });
      surveyEditorCallbackOnSave?.showSaveSuccess();
    } catch (error) {
      surveyEditorCallbackOnSave?.showSaveError();
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useParticipateDialogStore;
