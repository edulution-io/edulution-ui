import mongoose from 'mongoose';

class CreateUserDto {
  username: string;

  email: string;

  password?: string;

  roles: string[];

  usersSurveys?: {
    openSurveys?: mongoose.Types.ObjectId[];
    createdSurveys?: mongoose.Types.ObjectId[];
    answeredSurveys?: {
      surveyId: mongoose.Types.ObjectId;
      answer?: JSON;
    }[];
  };
}

export default CreateUserDto;
