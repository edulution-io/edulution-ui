import SurveysPageView from '@libs/survey/types/page-view';
import SurveysTablesPageStore from '@/pages/Surveys/Tables/surveysTablePageStore';

const SurveysTablesPageStoreInitialState: Partial<SurveysTablesPageStore> = {
  selectedPageView: SurveysPageView.OPEN,

  selectedSurvey: undefined,

  answeredSurveys: [],
  isFetchingAnsweredSurveys: false,

  createdSurveys: [],
  isFetchingCreatedSurveys: false,

  openSurveys: [],
  isFetchingOpenSurveys: false,
};

export default SurveysTablesPageStoreInitialState;
