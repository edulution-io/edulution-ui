import mongoose from 'mongoose';
import { create } from 'zustand';
import { SURVEY_ANSWER_ENDPOINT } from '@libs/survey/surveys-endpoint';
import SurveysPageView from '@libs/survey/types/page-view';
import Survey from '@libs/survey/types/survey';
import eduApi from '@/api/eduApi';

interface CommitedAnswersDialogStore {
  updateSelectedPageView: (pageView: SurveysPageView) => void;
  selectedSurvey: Survey | undefined;
  selectSurvey: (survey: Survey | undefined) => void;

  isOpenCommitedAnswersDialog: boolean;
  openCommitedAnswersDialog: () => void;
  closeCommitedAnswersDialog: () => void;
  getUsersCommitedAnswer: (surveyId: mongoose.Types.ObjectId, userName?: string) => Promise<JSON | undefined>;
  user: string | undefined;
  selectUser: (user: string) => void;
  answer: JSON | undefined;
  isLoading: boolean;
  error: Error | null;

  reset: () => void;
}

const initialState: Partial<CommitedAnswersDialogStore> = {
  selectedSurvey: undefined,
  isOpenCommitedAnswersDialog: false,
  user: undefined,
  answer: undefined,
  isLoading: false,
  error: null,
};

const useCommitedAnswersDialogStore = create<CommitedAnswersDialogStore>((set) => ({
  ...(initialState as CommitedAnswersDialogStore),
  reset: () => set(initialState),

  selectSurvey: (survey: Survey | undefined) => set({ selectedSurvey: survey }),

  openCommitedAnswersDialog: () => set({ isOpenCommitedAnswersDialog: true }),
  closeCommitedAnswersDialog: () => set({ isOpenCommitedAnswersDialog: false }),
  selectUser: (userName: string) => set({ user: userName }),
  getUsersCommitedAnswer: async (surveyId: mongoose.Types.ObjectId): Promise<JSON | undefined> => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<JSON>(SURVEY_ANSWER_ENDPOINT, {
        params: { surveyId },
      });
      const answer = response.data;
      set({ answer, isLoading: false });
      return answer;
    } catch (error) {
      set({ answer: undefined, error: error instanceof Error ? error : null, isLoading: false });
      return undefined;
    }
  },
}));

export default useCommitedAnswersDialogStore;
