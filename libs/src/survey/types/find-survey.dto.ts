import mongoose from 'mongoose';

type FindSurveyDto = {
  surveyId?: mongoose.Types.ObjectId;

  surveyIds?: mongoose.Types.ObjectId[];
};

export default FindSurveyDto;
