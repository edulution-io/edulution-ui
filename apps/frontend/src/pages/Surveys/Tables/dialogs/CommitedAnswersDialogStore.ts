import { create } from 'zustand';
import { AxiosError } from 'axios';
import SURVEYS_ENDPOINT from '@libs/survey/utils/surveys-endpoint';
import SurveysPageView from '@libs/survey/types/page-view';
import Survey from '@libs/survey/types/survey';
import { EMPTY_JSON } from '@libs/survey/utils/empty-json';
import eduApi from '@/api/eduApi';
import UserSurveySearchTypes from '@libs/survey/types/user-survey-search-types-enum';

interface CommitedAnswersDialogStore {
  updateSelectedPageView: (pageView: SurveysPageView) => void;
  selectedSurvey: Survey | undefined;
  selectSurvey: (survey: Survey | undefined) => void;

  isOpenCommitedAnswersDialog: boolean;
  openCommitedAnswersDialog: () => void;
  closeCommitedAnswersDialog: () => void;
  getUsersCommitedAnswer: (surveyId: number, userName?: string) => Promise<JSON | undefined>;
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
  getUsersCommitedAnswer: async (surveyId: number): Promise<JSON> => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<JSON>(SURVEYS_ENDPOINT, {
        params: { search: UserSurveySearchTypes.ANSWER, surveyId },
      });
      const answer = response.data;
      set({ answer, isLoading: false });
      return answer;
    } catch (error) {
      set({ answer: undefined, error: error as AxiosError, isLoading: false });
      return EMPTY_JSON;
    }
  },
}));

export default useCommitedAnswersDialogStore;
