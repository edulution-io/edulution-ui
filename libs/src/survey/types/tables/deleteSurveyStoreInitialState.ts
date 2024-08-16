import DeleteSurveyStore from '@libs/survey/types/tables/deleteSurveyStore';

const DeleteSurveyStoreInitialState: Partial<DeleteSurveyStore> = {
  selectedSurvey: undefined,
  isLoading: false,
};

export default DeleteSurveyStoreInitialState;
