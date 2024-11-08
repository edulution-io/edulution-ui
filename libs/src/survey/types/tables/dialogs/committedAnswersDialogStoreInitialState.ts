import CommittedAnswersDialogStore from './committedAnswersDialogStore';

const CommittedAnswersDialogStoreInitialState: Partial<CommittedAnswersDialogStore> = {
  selectedSurvey: undefined,
  isOpenCommitedAnswersDialog: false,
  user: undefined,
  answer: undefined,
  isLoading: false,
};

export default CommittedAnswersDialogStoreInitialState;
