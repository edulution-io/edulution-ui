import mongoose from 'mongoose';
import Attendee from '@libs/survey/types/attendee';

class UpdateOrCreateSurveyDto {
  _id: mongoose.Types.ObjectId;

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

export default UpdateOrCreateSurveyDto;
