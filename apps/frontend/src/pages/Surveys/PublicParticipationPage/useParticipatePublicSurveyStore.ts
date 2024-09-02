import mongoose from 'mongoose';
import { create } from 'zustand';
import { CompleteEvent } from 'survey-core';
import { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/api/surveys-endpoint';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import ParticipatePublicSurveyStore from '@libs/survey/types/participatePublicSurveyStore';
import ParticipatePublicSurveyStoreInitialState from '@libs/survey/constants/participatePublicSurveyStoreInitialPage';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

const useParticipatePublicSurveyStore = create<ParticipatePublicSurveyStore>((set) => ({
  ...ParticipatePublicSurveyStoreInitialState,
  reset: () => set(ParticipatePublicSurveyStoreInitialState),

  setAnswer: (answer: JSON) => set({ answer }),
  setPageNo: (pageNo: number) => set({ pageNo }),

  getPublicSurvey: async (surveyId: string): Promise<void> => {
    set({ isFetching: true });
    try {
      const response = await eduApi.get<SurveyDto>(`${PUBLIC_SURVEYS_ENDPOINT}/`, { params: { surveyId } });
      const survey = response.data;
      set({ survey });
    } catch (error) {
      set({ survey: undefined });
      handleApiError(error, set);
    } finally {
      set({ isFetching: false });
    }
  },

  setIsOpenCommitAnswerDialog: (isOpenCommitAnswerDialog: boolean) => set({ isOpenCommitAnswerDialog }),
  setUsername: (username: string) => set({ username }),

  answerPublicSurvey: async (
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
    username: string,
    surveyEditorCallbackOnSave?: CompleteEvent,
  ): Promise<void> => {
    set({ isSubmitting: true });
    try {
      surveyEditorCallbackOnSave?.showSaveInProgress();
      await eduApi.patch<string>(PUBLIC_SURVEYS_ENDPOINT, {
        surveyId,
        saveNo,
        answer,
        username,
      });
      surveyEditorCallbackOnSave?.showSaveSuccess();
    } catch (error) {
      surveyEditorCallbackOnSave?.showSaveError();
      handleApiError(error, set);
    } finally {
      set({ isSubmitting: false, isOpenCommitAnswerDialog: false });
    }
  },
}));

export default useParticipatePublicSurveyStore;
