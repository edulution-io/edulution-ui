import mongoose from 'mongoose';
import { create } from 'zustand';
import { CompleteEvent } from 'survey-core';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import ParticipatePublicSurveyStore from '@libs/survey/types/participatePublicSurveyStore';
import ParticipatePublicSurveyStoreInitialState from '@libs/survey/types/participatePublicSurveyStoreInitialState';
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
      const publicSurvey = response.data;
      set({ publicSurvey });
    } catch (error) {
      set({ publicSurvey: undefined });
      handleApiError(error, set);
    } finally {
      set({ isFetching: false });
    }
  },

  answerPublicSurvey: async (
    surveyId: string | mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
    surveyEditorCallbackOnSave?: CompleteEvent,
  ): Promise<void> => {
    set({ isSubmitting: true });
    try {
      surveyEditorCallbackOnSave?.showSaveInProgress();
      await eduApi.post<string>(PUBLIC_SURVEYS_ENDPOINT, {
        surveyId,
        saveNo,
        answer,
      });
      surveyEditorCallbackOnSave?.showSaveSuccess();
    } catch (error) {
      surveyEditorCallbackOnSave?.showSaveError();
      handleApiError(error, set);
    } finally {
      set({ isSubmitting: false });
    }
  },
}));

export default useParticipatePublicSurveyStore;
