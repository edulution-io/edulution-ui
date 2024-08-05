import mongoose from 'mongoose';
import { create } from 'zustand';
import { SURVEY_ANSWER_ENDPOINT } from '@libs/survey/surveys-endpoint';
import SurveyDto from '@libs/survey/types/survey.dto';
import SurveyAnswerDto from '@libs/survey/types/survey-answer.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import CommitedAnswersDialogStoreInitialState from '@/pages/Surveys/Tables/dialogs/commited-answers/commitedAnswersDialogStoreInitialState';
import CommitedAnswersDialogStore from './commitedAnswersDialogStore';

const useCommitedAnswersDialogStore = create<CommitedAnswersDialogStore>((set) => ({
  ...(CommitedAnswersDialogStoreInitialState as CommitedAnswersDialogStore),
  reset: () => set(CommitedAnswersDialogStoreInitialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  setIsOpenCommitedAnswersDialog: (state: boolean) => set({ isOpenCommitedAnswersDialog: state }),
  selectUser: (userName: string) => set({ user: userName }),
  getCommittedSurveyAnswers: async (surveyId: mongoose.Types.ObjectId, participant?: string): Promise<void> => {
    set({ isLoading: true });
    try {
      const response = await eduApi.post<SurveyAnswerDto>(SURVEY_ANSWER_ENDPOINT, { surveyId, participant });
      const surveyAnswer = response.data;
      const { answer } = surveyAnswer;
      set({ answer });
    } catch (error) {
      set({ answer: undefined });
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useCommitedAnswersDialogStore;
