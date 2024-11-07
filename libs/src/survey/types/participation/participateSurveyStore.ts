import CommitAnswerDto from '@libs/survey/types/api/commit-answer.dto';

interface ParticipateSurveyStore {
  answer: JSON;
  setAnswer: (answer: JSON) => void;
  pageNo: number;
  setPageNo: (pageNo: number) => void;
  answerSurvey: (answerDto: CommitAnswerDto) => Promise<boolean>;
  isSubmitting: boolean;
  hasFinished: boolean;
  setHasFinished: (hasFinished: boolean) => void;
  reset: () => void;
}

export default ParticipateSurveyStore;
