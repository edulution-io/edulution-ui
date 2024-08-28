import mongoose from 'mongoose';

interface PushAnswerToPublicSurveyDto {
  surveyId: mongoose.Types.ObjectId;

  saveNo: number;

  answer: JSON;

  username: string;
}

export default PushAnswerToPublicSurveyDto;
