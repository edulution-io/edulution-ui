import mongoose from 'mongoose';
import { create } from 'zustand';
import { CompleteEvent } from 'survey-core';
import SURVEYS_ENDPOINT from '@libs/survey/constants/surveys-endpoint';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import ParticipateDialogStoreInitialState from '@libs/survey/types/tables/dialogs/participateDialogStoreInitialState';
import ParticipateDialogStore from '@libs/survey/types/tables/dialogs/participateDialogStore';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

const useParticipateDialogStore = create<ParticipateDialogStore>((set) => ({
  ...(ParticipateDialogStoreInitialState as ParticipateDialogStore),
  reset: () => set(ParticipateDialogStoreInitialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),
  setAnswer: (answer: JSON) => set({ answer }),
  setPageNo: (pageNo: number) => set({ pageNo }),

  setIsOpenParticipateSurveyDialog: (state: boolean) =>
    !state ? set(ParticipateDialogStoreInitialState) : set({ isOpenParticipateSurveyDialog: state }),

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
