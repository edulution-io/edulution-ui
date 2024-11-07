import mongoose from 'mongoose';
import { CompleteEvent } from 'survey-core';

interface CommitAnswerDto {
  surveyId: mongoose.Types.ObjectId;

  saveNo: number;

  answer: JSON;

  surveyEditorCallbackOnSave?: CompleteEvent | undefined;

  isPublic: boolean;
}

export default CommitAnswerDto;
