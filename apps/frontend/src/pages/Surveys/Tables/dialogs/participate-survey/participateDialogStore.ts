import mongoose from 'mongoose';
import { CompleteEvent } from 'survey-core';
import SurveyDto from '@libs/survey/types/survey.dto';

interface ParticipateDialogStore {
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  answer: JSON;
  setAnswer: (answer: JSON | undefined) => void;

  isOpenParticipateSurveyDialog: boolean;
  setIsOpenParticipateSurveyDialog: (state: boolean) => void;
  answerSurvey: (
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
    options?: CompleteEvent,
  ) => Promise<void>;
  isLoading: boolean;

  reset: () => void;
}

export default ParticipateDialogStore;