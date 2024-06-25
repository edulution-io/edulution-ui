import mongoose from 'mongoose';

interface GetAnswerDto {
  surveyId: mongoose.Types.ObjectId;

  participant?: string;
}

export default GetAnswerDto;
