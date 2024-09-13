import mongoose from 'mongoose';
import SurveyDto from '@libs/survey/types/api/survey.dto';

interface DeleteSurveyStore {
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  deleteSurvey: (surveyIds: mongoose.Types.ObjectId[]) => Promise<void>;
  isLoading: boolean;

  reset: () => void;
}

export default DeleteSurveyStore;
