import mongoose from 'mongoose';

type PushAnswerDto = {
  surveyId: mongoose.Types.ObjectId;

  answer: JSON;

  isAnonymous?: boolean;

  canSubmitMultipleAnswers?: boolean;
};

export default PushAnswerDto;
