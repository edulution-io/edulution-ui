import SurveysPageView from '@libs/survey/types/api/page-view';
import SurveysTablesPageStore from '@libs/survey/types/tables/surveysTablePageStore';

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
