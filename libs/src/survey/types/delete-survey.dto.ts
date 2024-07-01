import mongoose from 'mongoose';

type DeleteSurveyDto = {
  surveyIds: mongoose.Types.ObjectId[];
};

export default DeleteSurveyDto;
