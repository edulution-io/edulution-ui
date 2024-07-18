import mongoose from 'mongoose';

type SurveyAnswerDto = {
  id: mongoose.Types.ObjectId;
  user: string;
  surveyId: mongoose.Types.ObjectId;
  saveNo: number;
  answer: JSON;
};

export default SurveyAnswerDto;
