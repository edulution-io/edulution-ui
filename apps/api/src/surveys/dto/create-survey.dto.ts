import mongoose from 'mongoose';
import Attendee from '@libs/conferences/types/attendee';

class CreateSurveyDto {
  id: mongoose.Types.ObjectId;

  formula: JSON;

  participants: Attendee[];

  participated?: string[];

  publicAnswers?: JSON[];

  saveNo?: number;

  created?: Date;

  expirationDate?: Date;

  expirationTime?: string;

  isAnonymous?: boolean;

  canSubmitMultipleAnswers?: boolean;
}

export default CreateSurveyDto;
