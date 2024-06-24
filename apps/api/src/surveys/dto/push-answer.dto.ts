import mongoose from 'mongoose';

class PushAnswerDto {
  surveyId: mongoose.Types.ObjectId;

  answer: JSON;

  isAnonymous?: boolean;

  canSubmitMultipleAnswers?: boolean;
}

export default PushAnswerDto;
