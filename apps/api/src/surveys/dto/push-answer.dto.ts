class PushAnswerDto {
  surveyname: string;

  answer: string;

  isAnonymous?: boolean;

  canSubmitMultipleAnswers?: boolean;
}

export default PushAnswerDto;
