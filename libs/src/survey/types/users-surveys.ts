import mongoose from 'mongoose';

type UsersSurveys = {
  openSurveys: mongoose.Types.ObjectId[];
  createdSurveys: mongoose.Types.ObjectId[];
  answeredSurveys: mongoose.Types.ObjectId[];
};

export default UsersSurveys;
