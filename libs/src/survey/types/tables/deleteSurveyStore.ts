import SurveysPageView from '@libs/survey/types/api/page-view';
import SurveyDto from '@libs/survey/types/api/survey.dto';

interface DeleteSurveyStore {
  updateSelectedPageView: (pageView: SurveysPageView) => void;
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  deleteSurvey: (surveyIds: string[]) => Promise<void>;
  isLoading: boolean;

  reset: () => void;
}

export default DeleteSurveyStore;
