const ParticipatePublicSurveyStoreInitialState = {
  survey: undefined,
  answer: {} as JSON,
  pageNo: 0,
  isFetching: false,
  isOpenCommitAnswerDialog: false,
  username: '',
  isSubmitting: false,
};

export default ParticipatePublicSurveyStoreInitialState;
