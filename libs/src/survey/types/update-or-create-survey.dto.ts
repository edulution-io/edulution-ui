import mongoose from 'mongoose';
import AttendeeDto from '@libs/conferences/types/attendee.dto';

interface UpdateOrCreateSurveyDto {
  id: mongoose.Types.ObjectId;

  formula: JSON;

  participants: AttendeeDto[];

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
