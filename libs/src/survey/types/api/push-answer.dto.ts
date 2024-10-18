import mongoose from 'mongoose';

interface PushAnswerDto {
  surveyId: mongoose.Types.ObjectId;

  saveNo: number;

  answer: JSON;
}

export default PushAnswerDto;
