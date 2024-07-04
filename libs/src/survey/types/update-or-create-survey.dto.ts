import mongoose from 'mongoose';
import AttendeeDto from '@libs/conferences/types/attendee.dto';

interface UpdateOrCreateSurveyDto {
  // ADDITIONAL
  participants: AttendeeDto[];

  // SURVEY
  id: mongoose.Types.ObjectId;

  formula: JSON;

  saveNo?: number;

  created?: Date;

  expirationDate?: Date;

  expirationTime?: string;

  isAnonymous?: boolean;

  canSubmitMultipleAnswers?: boolean;
}

export default UpdateOrCreateSurveyDto;
