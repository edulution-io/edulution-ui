import mongoose from 'mongoose';

interface PushAnswerDto {
  surveyId: mongoose.Types.ObjectId;

  answer: JSON;
}

export default PushAnswerDto;
