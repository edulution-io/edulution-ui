import CommitedAnswersDialogStore from './commitedAnswersDialogStore';

const CommitedAnswersDialogStoreInitialState: Partial<CommitedAnswersDialogStore> = {
  selectedSurvey: undefined,
  isOpenCommitedAnswersDialog: false,
  user: undefined,
  answer: undefined,
  isLoading: false,
};

export default CommitedAnswersDialogStoreInitialState;
