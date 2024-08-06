import mongoose from 'mongoose';
import SurveysPageView from '@libs/survey/types/api/page-view';
import SurveyDto from '@libs/survey/types/api/survey.dto';

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

export default CommitedAnswersDialogStore;
