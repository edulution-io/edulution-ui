import mongoose from 'mongoose';

function getNewSurveyId(): mongoose.Types.ObjectId {
  return mongoose.Types.ObjectId.createFromTime(new Date().getTime());
}

export default getNewSurveyId;
