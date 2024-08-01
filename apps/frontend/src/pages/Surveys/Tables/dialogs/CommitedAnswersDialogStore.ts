import mongoose from 'mongoose';
import { create } from 'zustand';
import { SURVEY_ANSWER_ENDPOINT } from '@libs/survey/surveys-endpoint';
import SurveysPageView from '@libs/survey/types/page-view';
import SurveyDto from '@libs/survey/types/survey.dto';
import SurveyAnswerDto from '@libs/survey/types/survey-answer.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface CommitedAnswersDialogStore {
  updateSelectedPageView: (pageView: SurveysPageView) => void;
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  isOpenCommitedAnswersDialog: boolean;
  setIsOpenCommitedAnswersDialog: (state: boolean) => void;
  getCommittedSurveyAnswers: (surveyId: mongoose.Types.ObjectId, participant?: string) => Promise<void>;
  user: string | undefined;
  selectUser: (user: string) => void;
  answer: JSON | undefined;
  isLoading: boolean;

  reset: () => void;
}

const initialState: Partial<CommitedAnswersDialogStore> = {
  selectedSurvey: undefined,
  isOpenCommitedAnswersDialog: false,
  user: undefined,
  answer: undefined,
  isLoading: false,
};

const useCommitedAnswersDialogStore = create<CommitedAnswersDialogStore>((set) => ({
  ...(initialState as CommitedAnswersDialogStore),
  reset: () => set(initialState),

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
