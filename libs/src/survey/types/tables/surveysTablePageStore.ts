import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveysPageView from '@libs/survey/types/api/page-view';

interface SurveysTablesPageStore {
  selectedPageView: SurveysPageView;
  updateSelectedPageView: (pageView: SurveysPageView) => void;

  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  updateUsersSurveys: () => Promise<void>;

  openSurveys: SurveyDto[];
  updateOpenSurveys: () => Promise<void>;
  isFetchingOpenSurveys: boolean;

  createdSurveys: SurveyDto[];
  updateCreatedSurveys: () => Promise<void>;
  isFetchingCreatedSurveys: boolean;

  answeredSurveys: SurveyDto[];
  updateAnsweredSurveys: () => Promise<void>;
  isFetchingAnsweredSurveys: boolean;

  reset: () => void;
}

export default SurveysTablesPageStore;
