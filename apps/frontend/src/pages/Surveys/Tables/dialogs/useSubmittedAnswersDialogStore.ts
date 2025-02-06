import { create } from 'zustand';
import { SURVEY_ANSWER_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyAnswerDto from '@libs/survey/types/api/survey-answer.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import SurveysPageView from '@libs/survey/types/api/page-view';

interface SubmittedAnswersDialogStore {
  updateSelectedPageView: (pageView: SurveysPageView) => void;
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  isOpenSubmittedAnswersDialog: boolean;
  setIsOpenSubmittedAnswersDialog: (state: boolean) => void;
  getSubmittedSurveyAnswers: (surveyId: string, participant?: string) => Promise<void>;
  user: string | undefined;
  selectUser: (user: string) => void;
  answer: JSON;
  isLoading: boolean;

  reset: () => void;
}

const SubmittedAnswersDialogStoreInitialState: Partial<SubmittedAnswersDialogStore> = {
  selectedSurvey: undefined,
  isOpenSubmittedAnswersDialog: false,
  user: undefined,
  answer: {} as JSON,
  isLoading: false,
};

const useSubmittedAnswersDialogStore = create<SubmittedAnswersDialogStore>((set) => ({
  ...(SubmittedAnswersDialogStoreInitialState as SubmittedAnswersDialogStore),
  reset: () => set(SubmittedAnswersDialogStoreInitialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  setIsOpenSubmittedAnswersDialog: (state: boolean) => set({ isOpenSubmittedAnswersDialog: state }),
  selectUser: (userName: string) => set({ user: userName }),
  getSubmittedSurveyAnswers: async (surveyId: string, participant?: string): Promise<void> => {
    set({ isLoading: true });
    try {
      const response = await eduApi.post<SurveyAnswerDto>(SURVEY_ANSWER_ENDPOINT, { surveyId, participant });
      const surveyAnswer = response.data;
      const { answer } = surveyAnswer;
      set({ answer });
    } catch (error) {
      set({ answer: {} as JSON });
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useSubmittedAnswersDialogStore;
