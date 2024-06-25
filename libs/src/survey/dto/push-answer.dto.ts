import mongoose from 'mongoose';

interface PushAnswerDto {
  surveyId: mongoose.Types.ObjectId;

  answer: JSON;

  isAnonymous?: boolean;

  canSubmitMultipleAnswers?: boolean;
}

export default PushAnswerDto;
