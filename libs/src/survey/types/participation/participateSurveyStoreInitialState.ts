import ParticipateSurveyStore from './participateSurveyStore';

const ParticipateSurveyStoreInitialState: Partial<ParticipateSurveyStore> = {
  pageNo: 0,
  answer: {} as JSON,
  isSubmitting: false,
  hasFinished: false,
};

export default ParticipateSurveyStoreInitialState;
