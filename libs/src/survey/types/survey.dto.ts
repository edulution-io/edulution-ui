import mongoose from 'mongoose';
import AttendeeDto from '@libs/conferences/types/attendee.dto';

interface SurveyDto {
  id: mongoose.Types.ObjectId;
  formula: JSON;
  publicAnswers: JSON[];
  participants: AttendeeDto[];
  participated: string[];
  saveNo: number;
  created?: Date;
  expirationDate?: Date;
  expirationTime?: string;
  isAnonymous?: boolean;

  canShowResultsTable?: boolean;
  canShowResultsChart?: boolean;

  canSubmitMultipleAnswers?: boolean;
}

export default SurveyDto;
