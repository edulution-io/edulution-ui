import mongoose from 'mongoose';

type SurveyAnswerDto = {
  surveyId: mongoose.Types.ObjectId;

  answer?: JSON;
};

export default SurveyAnswerDto;
