import mongoose from 'mongoose';
import SurveyDto from '@libs/survey/types/api/survey.dto';

interface ResultDialogStore {
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  isOpenPublicResultsTableDialog: boolean;
  setIsOpenPublicResultsTableDialog: (state: boolean) => void;
  isOpenPublicResultsVisualisationDialog: boolean;
  setIsOpenPublicResultsVisualisationDialog: (state: boolean) => void;
  getSurveyResult: (surveyId: mongoose.Types.ObjectId) => Promise<void>;
  result: JSON[] | undefined;
  isLoading: boolean;

  reset: () => void;
}

export default ResultDialogStore;
