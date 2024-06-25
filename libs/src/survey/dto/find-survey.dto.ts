import mongoose from 'mongoose';

class FindSurveyDto {
  surveyId?: mongoose.Types.ObjectId;

  surveyIds: mongoose.Types.ObjectId[];

  username?: string;

  isAnonymous?: boolean;

  participants?: string[];
}

export default FindSurveyDto;
