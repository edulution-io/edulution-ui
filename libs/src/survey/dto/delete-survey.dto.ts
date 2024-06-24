import mongoose from 'mongoose';

class DeleteSurveyDto {
  surveyIds: mongoose.Types.ObjectId[];
}

export default DeleteSurveyDto;
