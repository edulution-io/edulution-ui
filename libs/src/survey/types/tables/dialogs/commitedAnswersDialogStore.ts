import mongoose from 'mongoose';
import SurveyDto from '@libs/survey/types/api/survey.dto';

interface CommitedAnswersDialogStore {
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
