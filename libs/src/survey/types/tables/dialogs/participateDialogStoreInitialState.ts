import ParticipateDialogStore from './participateDialogStore';

const ParticipateDialogStoreInitialState: Partial<ParticipateDialogStore> = {
  selectedSurvey: undefined,
  pageNo: 0,
  answer: {} as JSON,
  isLoading: false,
};

export default ParticipateDialogStoreInitialState;
