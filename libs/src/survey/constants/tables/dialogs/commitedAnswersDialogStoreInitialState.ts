import CommitedAnswersDialogStore from '@libs/survey/types/tables/dialogs/commitedAnswersDialogStore';

const CommitedAnswersDialogStoreInitialState: Partial<CommitedAnswersDialogStore> = {
  selectedSurvey: undefined,
  isOpenCommitedAnswersDialog: false,
  user: undefined,
  answer: undefined,
  isLoading: false,
};

export default CommitedAnswersDialogStoreInitialState;
