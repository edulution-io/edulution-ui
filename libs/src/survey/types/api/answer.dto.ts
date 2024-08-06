import mongoose from 'mongoose';

interface AnswerDto {
  surveyId: mongoose.Types.ObjectId;

  attendee?: string;
}

export default AnswerDto;
