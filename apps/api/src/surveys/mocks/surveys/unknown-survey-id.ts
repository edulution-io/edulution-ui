import mongoose from 'mongoose';

const unknownSurveyId = mongoose.Types.ObjectId.createFromTime(new Date().getTime());

export default unknownSurveyId;
