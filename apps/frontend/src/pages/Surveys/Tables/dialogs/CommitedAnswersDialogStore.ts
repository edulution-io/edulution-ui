import mongoose from 'mongoose';
import { create } from 'zustand';
import { toast } from 'sonner';
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
  openCommitedAnswersDialog: () => void;
  closeCommitedAnswersDialog: () => void;
  getCommittedSurveyAnswers: (surveyId: mongoose.Types.ObjectId, participant?: string) => Promise<JSON | undefined>;
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

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  openCommitedAnswersDialog: () => set({ isOpenCommitedAnswersDialog: true }),
  closeCommitedAnswersDialog: () => set({ isOpenCommitedAnswersDialog: false }),
  selectUser: (userName: string) => set({ user: userName }),
  getCommittedSurveyAnswers: async (
    surveyId: mongoose.Types.ObjectId,
    participant?: string,
  ): Promise<JSON | undefined> => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.post<SurveyAnswerDto>(SURVEY_ANSWER_ENDPOINT, { surveyId, participant });
      const surveyAnswer = response.data;
      const { answer } = surveyAnswer;
      set({ answer, isLoading: false });
      return answer;
    } catch (error) {
      set({ answer: undefined, error: error instanceof Error ? error : null, isLoading: false });
      toast.error(error instanceof Error ? `${error.name}: ${error.message}` : 'Error while fetching an answer');
      handleApiError(error, set);
      return undefined;
    }
  },
}));

export default useCommitedAnswersDialogStore;
