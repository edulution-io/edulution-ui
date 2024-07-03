import mongoose from 'mongoose';
import AttendeeDto from '@libs/conferences/types/attendee.dto';

interface SurveyEditorFormData {
  id: mongoose.Types.ObjectId;
  formula: JSON;
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

export default SurveyEditorFormData;
