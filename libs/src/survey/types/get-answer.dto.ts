import mongoose from 'mongoose';

interface GetAnswerDto {
  surveyId: mongoose.Types.ObjectId;

  attendee?: string;
}

export default GetAnswerDto;
