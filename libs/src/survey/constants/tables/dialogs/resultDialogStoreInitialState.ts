import ResultDialogStore from '@libs/survey/types/tables/dialogs/resultDialogStore';

const ResultDialogStoreInitialState: Partial<ResultDialogStore> = {
  selectedSurvey: undefined,
  isOpenPublicResultsTableDialog: false,
  isOpenPublicResultsVisualisationDialog: false,
  result: undefined,
  isLoading: false,
};

export default ResultDialogStoreInitialState;
