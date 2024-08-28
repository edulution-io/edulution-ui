import ParticipateDialogStore from '../../../types/tables/dialogs/participateDialogStore';

const ParticipateDialogStoreInitialState: Partial<ParticipateDialogStore> = {
  selectedSurvey: undefined,
  pageNo: 0,
  answer: {} as JSON,
  isOpenParticipateSurveyDialog: false,
  isLoading: false,
};

export default ParticipateDialogStoreInitialState;
