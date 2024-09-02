import mongoose from 'mongoose';
import { CompleteEvent } from 'survey-core';
import SurveyDto from '@libs/survey/types/api/survey.dto';

interface ParticipatePublicSurveyStore {
  survey: SurveyDto | undefined;

  answer: JSON;
  setAnswer: (answer: JSON) => void;
  pageNo: number;
  setPageNo: (pageNo: number) => void;

  getPublicSurvey: (surveyId: string) => Promise<void>;
  isFetching: boolean;

  isOpenCommitAnswerDialog: boolean;
  setIsOpenCommitAnswerDialog: (isOpenCommitAnswerDialog: boolean) => void;
  username: string;
  setUsername: (username: string) => void;

  answerPublicSurvey: (
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
    username: string,
    options?: CompleteEvent,
  ) => Promise<void>;
  isSubmitting: boolean;

  reset: () => void;
}

export default ParticipatePublicSurveyStore;
