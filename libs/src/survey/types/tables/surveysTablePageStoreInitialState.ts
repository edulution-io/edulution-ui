import SurveysTablesPageStore from '@libs/survey/types/tables/surveysTablePageStore';

const SurveysTablesPageStoreInitialState: Partial<SurveysTablesPageStore> = {
  selectedSurvey: undefined,

  canParticipate: false,

  answeredSurveys: [],
  isFetchingAnsweredSurveys: false,

  createdSurveys: [],
  isFetchingCreatedSurveys: false,

  openSurveys: [],
  isFetchingOpenSurveys: false,
};

export default SurveysTablesPageStoreInitialState;
