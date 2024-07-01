import mongoose from 'mongoose';

type SurveyAnswer = {
  surveyId: mongoose.Types.ObjectId;
  answer?: JSON;
};

export default SurveyAnswer;
