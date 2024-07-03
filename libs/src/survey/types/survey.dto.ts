import mongoose from 'mongoose';
import Attendee from '@libs/survey/types/attendee';

interface SurveyDto {
  id: mongoose.Types.ObjectId;
  formula: JSON;
  publicAnswers: JSON[];
  participants: Attendee[];
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
