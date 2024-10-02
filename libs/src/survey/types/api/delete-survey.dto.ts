import mongoose from 'mongoose';

interface DeleteSurveyDto {
  surveyIds: mongoose.Types.ObjectId[];
}

export default DeleteSurveyDto;
