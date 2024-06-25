import mongoose from 'mongoose';

interface GetAnswerDto {
  surveyId: mongoose.Types.ObjectId;

  participants: string[];
}

export default GetAnswerDto;
