import mongoose from 'mongoose';

interface FindSurveyDto {
  surveyIds?: mongoose.Types.ObjectId[];
}

export default FindSurveyDto;
