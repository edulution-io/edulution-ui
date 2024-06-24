import mongoose from 'mongoose';

export type SurveyAnswer = {
  surveyId: mongoose.Types.ObjectId;
  answer?: JSON;
};
