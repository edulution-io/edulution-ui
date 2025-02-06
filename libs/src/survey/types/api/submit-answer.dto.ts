import { CompleteEvent } from 'survey-core';

interface SubmitAnswerDto {
  surveyId: string;

  saveNo: number;

  answer: JSON;

  surveyEditorCallbackOnSave?: CompleteEvent | undefined;

  isPublic: boolean;
}

export default SubmitAnswerDto;
