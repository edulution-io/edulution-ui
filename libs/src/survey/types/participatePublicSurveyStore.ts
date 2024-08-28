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
  answerPublicSurvey: (
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
    options?: CompleteEvent,
  ) => Promise<void>;
  isSubmitting: boolean;

  reset: () => void;
}

export default ParticipatePublicSurveyStore;
