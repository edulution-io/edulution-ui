import ParticipateDialogStore from './participateDialogStore';

const ParticipateDialogStoreInitialState: Partial<ParticipateDialogStore> = {
  selectedSurvey: undefined,
  answer: {} as JSON,
  isOpenParticipateSurveyDialog: false,
  isLoading: false,
};

export default ParticipateDialogStoreInitialState;
