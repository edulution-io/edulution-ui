import mongoose from 'mongoose';

interface FindSurveyDto {
  surveyId?: mongoose.Types.ObjectId;

  surveyIds?: mongoose.Types.ObjectId[];
}

export default FindSurveyDto;
