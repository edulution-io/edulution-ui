import mongoose from 'mongoose';

type SurveyAnswerDto = {
  _id: mongoose.Types.ObjectId;
  id: mongoose.Types.ObjectId;
  username: string;
  surveyId: mongoose.Types.ObjectId;
  saveNo: number;
  answer: JSON;
};

export default SurveyAnswerDto;
