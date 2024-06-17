class PushAnswerDto {
  surveyId: number;

  answer: JSON;

  isAnonymous?: boolean;

  canSubmitMultipleAnswers?: boolean;
}

export default PushAnswerDto;
